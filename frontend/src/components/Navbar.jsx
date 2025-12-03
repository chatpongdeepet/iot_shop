import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, LogOut, Map, ChevronDown, Settings } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const handleLogoutClick = () => {
        setIsDropdownOpen(false);
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        logout();
        setShowLogoutConfirm(false);
        navigate('/');
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <>
            <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center space-x-8">
                            <Link to="/" className="text-xl font-bold text-blue-600">IoT Shop</Link>
                            <Link to="/products" className="text-gray-600 hover:text-blue-600 font-medium">Products</Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            {user && user.role === 'admin' && (
                                <Link to="/analytics" className="text-gray-600 hover:text-blue-600 flex items-center">
                                    <Map className="w-5 h-5 mr-1" />
                                    <span className="hidden sm:inline">Analytics</span>
                                </Link>
                            )}

                            {user && user.role === 'user' && (
                                <Link to="/cart" className="text-gray-601 hover:text-blue-600 flex items-center relative">
                                    <ShoppingCart className="w-7 h-6" />
                                    <span className="absolute -top-3 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                </Link>
                            )}

                            {user ? (
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 focus:outline-none"
                                    >
                                        <span>Hi, {user.full_name || user.email}</span>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100">
                                            {user.role === 'admin' && (
                                                <Link
                                                    to="/admin"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                >
                                                    Admin Dashboard
                                                </Link>
                                            )}
                                            <Link
                                                to="/profile"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                <User className="w-4 h-4 mr-2" />
                                                Profile
                                            </Link>
                                            <Link
                                                to="/settings"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                <Settings className="w-4 h-4 mr-2" />
                                                Settings
                                            </Link>
                                            <div className="border-t border-gray-100 my-1"></div>
                                            <button
                                                onClick={handleLogoutClick}
                                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                                            >
                                                <LogOut className="w-4 h-4 mr-2" />
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <Link to="/login" className="text-gray-600 hover:text-blue-600">Login</Link>
                                    <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl transform transition-all">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Logout</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to log out of your account?</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={cancelLogout}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
