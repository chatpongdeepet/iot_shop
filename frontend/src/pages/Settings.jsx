import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function Settings() {
    const { user } = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [formData, setFormData] = useState({
        address_line: '',
        city: '',
        province: '',
        zip_code: ''
    });
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState(null);
    const [editingAddressId, setEditingAddressId] = useState(null);

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const response = await api.get('/users/me/addresses');
            setAddresses(response.data);
        } catch (err) {
            console.error('Error fetching addresses:', err);
            // Don't show error if it's just empty or 404
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAddressId) {
                await api.put(`/users/me/addresses/${editingAddressId}`, formData);
                toast.success('Address updated successfully!');
            } else {
                await api.post('/users/me/addresses', formData);
                toast.success('Address added successfully!');
            }
            setIsAdding(false);
            setEditingAddressId(null);
            setFormData({
                address_line: '',
                city: '',
                province: '',
                zip_code: ''
            });
            fetchAddresses();
        } catch (err) {
            console.error('Error saving address:', err);
            if (err.response && err.response.data && err.response.data.detail) {
                toast.error(err.response.data.detail);
            } else {
                toast.error('Failed to save address.');
            }
        }
    };

    const handleEditClick = (addr) => {
        setFormData({
            address_line: addr.address_line,
            city: addr.city,
            province: addr.province,
            zip_code: addr.zip_code
        });
        setEditingAddressId(addr.id);
        setIsAdding(true);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingAddressId(null);
        setFormData({
            address_line: '',
            city: '',
            province: '',
            zip_code: ''
        });
    };

    const handleDeleteClick = (id) => {
        setAddressToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!addressToDelete) return;

        try {
            await api.delete(`/users/me/addresses/${addressToDelete}`);
            toast.success('Address removed successfully');
            fetchAddresses();
        } catch (err) {
            console.error('Error removing address:', err);
            toast.error('Failed to remove address');
        } finally {
            setShowDeleteModal(false);
            setAddressToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setAddressToDelete(null);
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Shipping Addresses</h1>

            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Saved Addresses ({addresses.length}/3)</h2>
                    {!isAdding && addresses.length < 3 && (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                        >
                            Add New Address
                        </button>
                    )}
                </div>

                {/* Address List */}
                {!isAdding && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
                        {addresses.map((addr) => (
                            <div key={addr.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow relative group">
                                <p className="font-medium text-gray-900 mb-1">{addr.address_line}</p>
                                <p className="text-gray-600">{addr.city}, {addr.province}</p>
                                <p className="text-gray-600">{addr.zip_code}</p>
                                <div className="mt-3 flex space-x-3">
                                    <button
                                        onClick={() => handleEditClick(addr)}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        Modify
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(addr.id)}
                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                        {addresses.length === 0 && (
                            <div className="col-span-full text-center py-8 text-gray-500">
                                No addresses saved yet.
                            </div>
                        )}
                    </div>
                )}

                {/* Add/Edit Address Form */}
                {isAdding && (
                    <form onSubmit={handleSubmit} className="border-t pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            {editingAddressId ? 'Edit Address' : 'New Address Details'}
                        </h3>
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Address Line</label>
                                <input
                                    type="text"
                                    name="address_line"
                                    value={formData.address_line}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Province</label>
                                    <input
                                        type="text"
                                        name="province"
                                        value={formData.province}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                                    <input
                                        type="text"
                                        name="zip_code"
                                        value={formData.zip_code}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    />
                                </div>
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    {editingAddressId ? 'Update Address' : 'Save Address'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                    <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Remove Address</h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500">
                                    Are you sure you want to remove this address? This action cannot be undone.
                                </p>
                            </div>
                            <div className="items-center px-4 py-3">
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 mb-2"
                                >
                                    Remove
                                </button>
                                <button
                                    onClick={cancelDelete}
                                    className="px-4 py-2 bg-white text-gray-700 text-base font-medium rounded-md w-full shadow-sm border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
