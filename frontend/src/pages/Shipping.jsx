import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Plus, MapPin, Check } from 'lucide-react';

export default function Shipping() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        address: '',
        city: '',
        postalCode: '',
        phoneNumber: ''
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await api.get('/auth/me');
            const userAddresses = response.data.addresses || [];
            setAddresses(userAddresses);

            // If user has addresses, select the first one by default
            if (userAddresses.length > 0) {
                setSelectedAddressId(userAddresses[0].id);
                setShowForm(false);
            } else {
                setShowForm(true);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            setShowForm(true);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddressSelect = (addressId) => {
        setSelectedAddressId(addressId);
        setShowForm(false);
    };

    const handleAddNewClick = () => {
        setSelectedAddressId(null);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let shippingData;
        if (showForm) {
            try {
                // Save the new address to the backend
                const response = await api.post('/users/me/addresses', {
                    address_line: formData.address,
                    city: formData.city,
                    province: formData.city, // Using city as province for now if not separate
                    zip_code: formData.postalCode
                });

                shippingData = {
                    address: response.data.address_line,
                    city: response.data.city,
                    postalCode: response.data.zip_code,
                    addressId: response.data.id
                };

                // Refresh addresses to show the new one in the list (optional, but good for state consistency)
                setAddresses(prev => [...prev, response.data]);

            } catch (error) {
                console.error('Error saving address:', error);
                alert('Failed to save address. Please try again.');
                return;
            }
        } else {
            const selected = addresses.find(a => a.id === selectedAddressId);
            if (!selected) {
                alert('Please select an address.');
                return;
            }
            shippingData = {
                address: selected.address_line,
                city: selected.city,
                postalCode: selected.zip_code,
                addressId: selected.id
            };
        }

        try {
            // Create Stripe Checkout Session
            const response = await api.post('/payments/create-checkout-session');
            // Redirect to Stripe
            window.location.href = response.data.url;
        } catch (error) {
            console.error('Error creating checkout session:', error);
            alert('Failed to initiate payment. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Shipping Information</h1>

            <div className="max-w-2xl mx-auto">
                {/* Existing Addresses */}
                {addresses.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Address</h2>
                        <div className="grid gap-4">
                            {addresses.map((addr) => (
                                <div
                                    key={addr.id}
                                    onClick={() => handleAddressSelect(addr.id)}
                                    className={`relative p-4 border rounded-lg cursor-pointer transition-all ${selectedAddressId === addr.id
                                        ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
                                        : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                >
                                    <div className="flex items-start">
                                        <MapPin className={`w-5 h-5 mt-1 mr-3 ${selectedAddressId === addr.id ? 'text-blue-600' : 'text-gray-400'}`} />
                                        <div>
                                            <p className="font-medium text-gray-900">{addr.address_line}</p>
                                            <p className="text-gray-600">{addr.city}, {addr.province} {addr.zip_code}</p>
                                        </div>
                                    </div>
                                    {selectedAddressId === addr.id && (
                                        <div className="absolute top-4 right-4 text-blue-600">
                                            <Check className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>
                            ))}

                            <button
                                onClick={handleAddNewClick}
                                className={`flex items-center justify-center p-4 border-2 border-dashed rounded-lg transition-colors ${showForm
                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                    : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600'
                                    }`}
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                <span className="font-medium">Add New Address</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Address Form */}
                {showForm && (
                    <div className="bg-white rounded-lg shadow-md p-8 animate-fade-in">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">
                            {addresses.length > 0 ? 'New Address Details' : 'Enter Shipping Details'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                    Address
                                </label>
                                <textarea
                                    id="address"
                                    name="address"
                                    rows="3"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.address}
                                    onChange={handleChange}
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        value={formData.city}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                                        Postal Code
                                    </label>
                                    <input
                                        type="text"
                                        id="postalCode"
                                        name="postalCode"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        value={formData.postalCode}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
                                >
                                    Continue to Payment
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Continue Button for Existing Address */}
                {!showForm && addresses.length > 0 && (
                    <div className="mt-8">
                        <button
                            onClick={handleSubmit}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
                        >
                            Proceed to Payment
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
