import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { ShoppingCart, ChevronLeft, ChevronRight, Search, Plus, Minus, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductsList() {
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [loading, setLoading] = useState(false);
    const { addToCart } = useCart();

    const [showQuantityModal, setShowQuantityModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);

    const ITEMS_PER_PAGE = 9;

    const openQuantityModal = (product) => {
        setSelectedProduct(product);
        setQuantity(1);
        setShowQuantityModal(true);
    };

    const closeQuantityModal = () => {
        setShowQuantityModal(false);
        setSelectedProduct(null);
        setQuantity(1);
    };

    const handleQuantityChange = (delta) => {
        setQuantity(prev => Math.max(1, prev + delta));
    };

    const handleConfirmAddToCart = () => {
        if (selectedProduct) {
            addToCart(selectedProduct.id, quantity);
            closeQuantityModal();
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [currentPage, sortBy, search]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/products', {
                params: {
                    skip: (currentPage - 1) * ITEMS_PER_PAGE,
                    limit: ITEMS_PER_PAGE,
                    search: search || undefined,
                    sort_by: sortBy || undefined
                }
            });
            setProducts(response.data.items);
            setTotalPages(Math.ceil(response.data.total / ITEMS_PER_PAGE));
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto lg:px-40 md:px-20 px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="relative w-full md:w-1/2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1); // Reset to first page on search
                        }}
                    />
                </div>
                <div className="flex items-center w-full md:w-auto">
                    <select
                        className="w-full md:w-auto border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="">Sort by: Default</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="name_asc">Name: A-Z</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {products.map((product) => (
                            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                <Link to={`/product/${product.id}`} className="block">
                                    <div className="h-48 bg-gray-200 flex items-center justify-center relative">
                                        {product.images && product.images.length > 0 ? (
                                            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-gray-400">No Image</span>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                                        <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-2xl font-bold text-blue-600">฿{product.price}</span>
                                            {product.stock > 0 ? (
                                                <button
                                                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors z-10 relative"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        openQuantityModal(product);
                                                    }}
                                                >
                                                    <ShoppingCart className="w-5 h-5" />
                                                </button>
                                            ) : (
                                                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded border border-red-400 z-10 relative">
                                                    Out of Stock
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>

                    {products.length === 0 && (
                        <div className="text-center text-gray-500 py-10">
                            No products found.
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-4 mb-8">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-full bg-white shadow hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <span className="text-gray-700 font-medium">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-full bg-white shadow hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Quantity Selection Modal */}
            {showQuantityModal && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden relative">
                        <button
                            onClick={closeQuantityModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h3>
                            <p className="text-gray-600 mb-6">Select quantity to add to cart</p>

                            <div className="flex items-center justify-center space-x-6 mb-8">
                                <button
                                    onClick={() => handleQuantityChange(-1)}
                                    className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="w-5 h-5 text-gray-600" />
                                </button>
                                <span className="text-3xl font-semibold text-gray-900 w-12 text-center">{quantity}</span>
                                <button
                                    onClick={() => handleQuantityChange(1)}
                                    className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                                >
                                    <Plus className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={handleConfirmAddToCart}
                                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    <span>Add to Cart - ฿{(selectedProduct.price * quantity).toLocaleString()}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
