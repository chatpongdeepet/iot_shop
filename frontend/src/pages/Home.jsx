import { Link } from 'react-router-dom';
import heroImage from '../assets/images/hero_image.png';

export default function Home() {
    return (
        <div
            className="relative flex flex-col items-center justify-center h-[calc(100vh-4rem)] text-center px-4 bg-cover bg-center overflow-hidden"
            style={{ backgroundImage: `url(${heroImage})` }}
        >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>

            <div className="relative z-10">
                <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-lg">
                    Welcome to IoT Shop
                </h1>
                <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto drop-shadow-md">
                    Discover the best IoT devices, sensors, and boards for your next project.
                    Premium quality, best prices.
                </p>
                <Link
                    to="/products"
                    className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
                >
                    Shop Now
                </Link>
            </div>
        </div>
    );
}
