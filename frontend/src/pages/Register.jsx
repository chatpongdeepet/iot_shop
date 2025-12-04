import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import heroImage from '../assets/images/hero_image.png';

export default function Register() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: ''
    });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', formData);
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            toast.error('Registration failed. Email might be taken.');
        }
    };

    return (
        <div
            className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
        >
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="relative z-10 max-w-md w-full bg-white/30 backdrop-blur-md p-8 rounded-lg shadow-xl border border-white/20">
                <h2 className="text-2xl font-bold mb-6 text-center text-white drop-shadow-md">Register</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-white mb-2 font-medium drop-shadow-sm">Full Name</label>
                        <input
                            type="text"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            className="w-full p-2 border border-white/30 rounded bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-white mb-2 font-medium drop-shadow-sm">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full p-2 border border-white/30 rounded bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-white mb-2 font-medium drop-shadow-sm">Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full p-2 border border-white/30 rounded bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 shadow-lg transition-colors">
                        Register
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <p className="text-white drop-shadow-sm">Already have an account? <Link to="/login" className="text-blue-300 hover:text-blue-200 font-semibold hover:underline">Login</Link></p>
                </div>
            </div>
        </div>
    );
}
