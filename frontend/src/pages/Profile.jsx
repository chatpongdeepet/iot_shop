import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
    const { user } = useAuth();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">User Profile</h1>
            <div className="bg-white shadow rounded-lg p-6">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-lg text-gray-900">{user?.full_name || 'None'}</p>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-lg text-gray-900">{user?.email || 'None'}</p>
                </div>
            </div>
        </div>
    );
}
