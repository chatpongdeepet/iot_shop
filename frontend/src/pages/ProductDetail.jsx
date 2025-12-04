import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { ShoppingCart, ArrowLeft, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const { addToCart } = useCart();

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await api.get(`/products/${id}`);
            setProduct(response.data);
        } catch (error) {
            console.error('Error fetching product:', error);
            // Redirect to home if product not found
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        try {
            setAdding(true);
            await addToCart(product.id, quantity);
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error adding to cart:', error);
            if (error.response && error.response.status === 401) {
                alert('Please login to add items to cart');
                navigate('/login');
            } else {
                alert('Failed to add to cart');
            }
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="container mx-auto lg:px-40 md:px-20 px-6 py-8">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Products
            </button>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="md:flex">
                    <div className="md:w-1/2 flex flex-col items-center">
                        <div className="h-96 w-full bg-gray-200 flex items-center justify-center mb-4 rounded-lg overflow-hidden">
                            {product.images && product.images.length > 0 ? (
                                <img
                                    src={product.images[selectedImageIndex]}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="text-gray-400 text-xl">No Image Available</span>
                            )}
                        </div>
                        {product.images && product.images.length > 1 && (
                            <div className="flex space-x-2 overflow-x-auto p-2 w-full justify-center">
                                {product.images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`h-20 w-20 rounded-md overflow-hidden border-2 flex-shrink-0 ${selectedImageIndex === index ? 'border-blue-600' : 'border-transparent'
                                            }`}
                                    >
                                        <img src={img} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-8 md:w-1/2 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                                <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                                    {product.category || 'General'}
                                </span>
                            </div>

                            <p className="text-3xl font-bold text-blue-600 mb-6">฿{product.price}</p>

                            <div className="prose max-w-none text-gray-600 mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                                <p>{product.description}</p>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Stock Status</h3>
                                <p className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {product.stock > 0 ? `${product.stock} items available` : 'Out of Stock'}
                                </p>
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <div className="flex items-center mb-6">
                                <span className="mr-4 font-medium text-gray-700">Quantity:</span>
                                <div className="flex items-center border rounded-lg">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="p-2 hover:bg-gray-100 transition-colors"
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="px-4 font-medium">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                        className="p-2 hover:bg-gray-100 transition-colors"
                                        disabled={quantity >= product.stock}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0 || adding}
                                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                            >
                                <ShoppingCart className="w-6 h-6 mr-2" />
                                {adding ? 'Adding...' : 'Add to Cart'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl transform transition-all text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <ShoppingCart className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Added to Cart!</h3>
                        <p className="text-gray-600 mb-6">
                            {product.name} has been added to your cart.
                        </p>
                        <div className="flex flex-col space-y-3">
                            <button
                                onClick={() => navigate('/cart')}
                                className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors font-medium"
                            >
                                Go to Cart
                            </button>
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors font-medium"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
