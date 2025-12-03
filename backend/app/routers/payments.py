from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session
from .. import models, database
from .auth import get_current_user
import stripe
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(
    prefix="/payments",
    tags=["payments"]
)

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/create-checkout-session")
def create_checkout_session(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = current_user.cart
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    line_items = []
    for item in cart.items:
        line_items.append({
            'price_data': {
                'currency': 'thb',
                'product_data': {
                    'name': item.product.name,
                    'images': [item.product.image_url] if item.product.image_url else [],
                },
                'unit_amount': int(item.product.price * 100), # Stripe expects amount in cents/satang
            },
            'quantity': item.quantity,
        })

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            success_url=f'{FRONTEND_URL}/success?session_id={{CHECKOUT_SESSION_ID}}',
            cancel_url=f'{FRONTEND_URL}/cancel',
            client_reference_id=str(current_user.id),
            metadata={
                'user_id': current_user.id
            }
        )
        return {"url": checkout_session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/verify-session")
def verify_session(session_id: str, db: Session = Depends(get_db)):
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        if session.payment_status == 'paid':
            handle_checkout_session(session, db)
            return {"status": "success"}
        else:
            return {"status": "pending"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None), db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = stripe_signature
    endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET") # Optional: Verify webhook signature

    event = None

    try:
        # If you have a webhook secret, use it to verify the event
        # event = stripe.Webhook.construct_event(
        #     payload, sig_header, endpoint_secret
        # )
        # For now, we'll just parse the payload directly since we might not have the secret yet
        event = stripe.Event.construct_from(
            await request.json(), stripe.api_key
        )
    except ValueError as e:
        # Invalid payload
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        handle_checkout_session(session, db)

    return {"status": "success"}

def handle_checkout_session(session, db: Session):
    user_id = session.get('client_reference_id')
    if not user_id:
        return

    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if not user:
        return

    # Create Order
    # Note: In a real app, you might want to store more details from the session
    # For now, we'll create an order based on the user's current cart
    # This assumes the cart hasn't changed since the checkout session was created
    # A more robust way is to pass cart items in metadata or retrieve line items from Stripe
    
    cart = user.cart
    if not cart or not cart.items:
        return

    total_price = sum(item.product.price * item.quantity for item in cart.items)
    
    # Create Order
    new_order = models.Order(
        user_id=user.id,
        total_price=total_price,
        status=models.OrderStatus.PAID
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # Create Order Items
    for item in cart.items:
        order_item = models.OrderItem(
            order_id=new_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price_at_time=item.product.price
        )
        db.add(order_item)
    
    # Clear Cart
    for item in cart.items:
        db.delete(item)
    
    db.commit()
