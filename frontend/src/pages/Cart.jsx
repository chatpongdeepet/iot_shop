import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Cart() {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [itemToDelete, setItemToDelete] = useState(null);
    const navigate = useNavigate();
    const { fetchCart: refreshGlobalCart } = useCart();

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const response = await api.get('/cart');
            setCart(response.data);
            // Also refresh global cart to ensure sync
            refreshGlobalCart();
        } catch (error) {
            console.error('Error fetching cart:', error);
            if (error.response && error.response.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId, newQuantity) => {
        try {
            const response = await api.put(`/cart/items/${itemId}`, { quantity: newQuantity });
            setCart(response.data);
            refreshGlobalCart();
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    };

    const confirmDelete = (itemId) => {
        setItemToDelete(itemId);
    };

    const cancelDelete = () => {
        setItemToDelete(null);
    };

    const executeDelete = async () => {
        if (!itemToDelete) return;
        try {
            const response = await api.delete(`/cart/items/${itemToDelete}`);
            setCart(response.data);
            refreshGlobalCart();
            setItemToDelete(null);
        } catch (error) {
            console.error('Error removing item:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
                <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
                <Link
                    to="/"
                    className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Start Shopping
                    <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 relative">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart Items */}
                <div className="lg:w-2/3">
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <ul className="divide-y divide-gray-200">
                            {cart.items.map((item) => (
                                <li key={item.id} className="p-6 flex flex-col sm:flex-row items-center gap-4">
                                    <div className="w-24 h-24 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
                                        {item.product.image_url ? (
                                            <img
                                                src={item.product.image_url}
                                                alt={item.product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                No Image
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 text-center sm:text-left">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            <Link to={`/product/${item.product.id}`} className="hover:text-blue-600">
                                                {item.product.name}
                                            </Link>
                                        </h3>
                                        <p className="text-gray-500 text-sm">{item.product.category}</p>
                                        <p className="text-blue-600 font-bold mt-1">฿{item.product.price}</p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center border rounded-lg">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="p-2 hover:bg-gray-100 text-gray-600"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="px-4 font-medium text-gray-900">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="p-2 hover:bg-gray-100 text-gray-600"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => confirmDelete(item.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                            title="Remove item"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:w-1/3">
                    <div className="bg-white rounded-lg shadow p-6 sticky top-24">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>฿{cart.total_price.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div className="border-t pt-4 flex justify-between font-bold text-lg text-gray-900">
                                <span>Total</span>
                                <span>฿{cart.total_price.toFixed(2)}</span>
                            </div>
                        </div>

                        <Link
                            to="/shipping"
                            className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md text-center"
                        >
                            Proceed to Shipping
                        </Link>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {itemToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Remove Item?</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to remove this item from your cart?</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
