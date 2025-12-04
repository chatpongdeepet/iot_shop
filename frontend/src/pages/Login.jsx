import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { toast } from 'react-toastify';
import heroImage from '../assets/images/hero_image.png';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // 1. Login to get access token
            // FastAPI OAuth2PasswordRequestForm expects form data
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const response = await api.post('/auth/login', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const { access_token } = response.data;

            // 2. Fetch user details using the new token
            const userResponse = await api.get('/auth/me', {
                headers: { Authorization: `Bearer ${access_token}` }
            });

            const userData = userResponse.data;

            // 3. Update AuthContext with token and user data (including role)
            login(access_token, userData);

            toast.success('Login successful!');
            navigate('/');
        } catch (err) {
            console.error('Login error:', err);
            const errorMessage = err.response?.data?.detail || 'Invalid credentials';
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    return (
        <div
            className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
        >
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="relative z-10 max-w-md w-full bg-white/30 backdrop-blur-md p-8 rounded-lg shadow-xl border border-white/20">
                <h2 className="text-2xl font-bold mb-6 text-center text-white drop-shadow-md">Login</h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-white mb-2 font-medium drop-shadow-sm">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border border-white/30 rounded bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-white mb-2 font-medium drop-shadow-sm">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border border-white/30 rounded bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 shadow-lg transition-colors">
                        Login
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <p className="text-white drop-shadow-sm">Don't have an account? <Link to="/register" className="text-blue-300 hover:text-blue-200 font-semibold hover:underline">Register</Link></p>
                </div>
            </div>
        </div>
    );
}
