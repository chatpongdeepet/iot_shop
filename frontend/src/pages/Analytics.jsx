import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api';

export default function Analytics() {
    const [activeTab, setActiveTab] = useState('orders');
    const [locations, setLocations] = useState({ features: [] });
    const [userCount, setUserCount] = useState(0);
    const [visitorCount, setVisitorCount] = useState(0);
    const [orderStats, setOrderStats] = useState(null);
    const [productStats, setProductStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [locationsRes, userCountRes, visitorCountRes, orderStatsRes, productStatsRes] = await Promise.all([
                    api.get('/analytics/locations'),
                    api.get('/analytics/users/count'),
                    api.get('/analytics/visitors/count'),
                    api.get('/analytics/orders/stats'),
                    api.get('/analytics/products/stats')
                ]);
                setLocations(locationsRes.data);
                setUserCount(userCountRes.data.count);
                setVisitorCount(visitorCountRes.data.count);
                setOrderStats(orderStatsRes.data);
                setProductStats(productStatsRes.data);
            } catch (error) {
                console.error('Error fetching analytics data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setSearchResults(null);
            return;
        }
        try {
            const response = await api.get(`/analytics/products/stats?q=${searchQuery}`);
            setSearchResults(response.data.search_results);
        } catch (error) {
            console.error('Error searching products:', error);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults(null);
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
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase">Total Revenue</h2>
                    <p className="text-2xl font-bold text-green-600">฿{orderStats?.total_revenue.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase">Total Orders</h2>
                    <p className="text-2xl font-bold text-blue-600">{orderStats?.total_orders}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase">Registered Users</h2>
                    <p className="text-2xl font-bold text-purple-600">{userCount}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase">Total Visitors</h2>
                    <p className="text-2xl font-bold text-orange-500">{visitorCount}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    className={`py-2 px-4 font-medium ${activeTab === 'orders' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('orders')}
                >
                    Orders
                </button>
                <button
                    className={`py-2 px-4 font-medium ${activeTab === 'products' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('products')}
                >
                    Products
                </button>
                <button
                    className={`py-2 px-4 font-medium ${activeTab === 'map' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('map')}
                >
                    Customer Map
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'orders' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Order Status */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-bold mb-4">Order Status Breakdown</h3>
                        <div className="space-y-4">
                            {Object.entries(orderStats?.status_counts || {}).map(([status, count]) => (
                                <div key={status} className="flex justify-between items-center border-b pb-2">
                                    <span className="capitalize text-gray-700">{status}</span>
                                    <span className="font-semibold bg-gray-100 px-3 py-1 rounded-full">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-bold mb-4">Recent Orders</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <th className="pb-3">ID</th>
                                        <th className="pb-3">Status</th>
                                        <th className="pb-3">Total</th>
                                        <th className="pb-3">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {orderStats?.recent_orders.map((order) => (
                                        <tr key={order.id} className="border-t">
                                            <td className="py-3">#{order.id}</td>
                                            <td className="py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                                    ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="py-3">฿{order.total_price}</td>
                                            <td className="py-3">{new Date(order.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'products' && (
                <div className="space-y-8">
                    {/* Search Bar */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Search
                            </button>
                            {searchResults && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </form>
                    </div>

                    {searchResults ? (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-bold mb-4">Search Results</h3>
                            {searchResults.length === 0 ? (
                                <p className="text-gray-500">No products found.</p>
                            ) : (
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <th className="pb-3">Product</th>
                                            <th className="pb-3 text-right">Stock</th>
                                            <th className="pb-3 text-right">Sold</th>
                                            <th className="pb-3 text-right">Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {searchResults.map((product) => (
                                            <tr key={product.id} className="border-t">
                                                <td className="py-3 font-medium">{product.name}</td>
                                                <td className="py-3 text-right">{product.stock}</td>
                                                <td className="py-3 text-right">{product.total_sold}</td>
                                                <td className="py-3 text-right">฿{product.revenue.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Top Selling */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-bold mb-4">Top Selling Products</h3>
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <th className="pb-3">Product</th>
                                            <th className="pb-3 text-right">Sold</th>
                                            <th className="pb-3 text-right">Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {productStats?.top_selling.map((product) => (
                                            <tr key={product.id} className="border-t">
                                                <td className="py-3 font-medium">{product.name}</td>
                                                <td className="py-3 text-right">{product.total_sold}</td>
                                                <td className="py-3 text-right">฿{product.revenue.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Low Stock */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-bold mb-4 text-red-600">Low Stock Alerts</h3>
                                {productStats?.low_stock.length === 0 ? (
                                    <p className="text-gray-500">No products are low on stock.</p>
                                ) : (
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                <th className="pb-3">Product</th>
                                                <th className="pb-3 text-right">Stock</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {productStats?.low_stock.map((product) => (
                                                <tr key={product.id} className="border-t">
                                                    <td className="py-3 font-medium">{product.name}</td>
                                                    <td className="py-3 text-right font-bold text-red-600">{product.stock}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'map' && (
                <div className="bg-white p-4 rounded-lg shadow-md h-[600px]">
                    <MapContainer center={[13.7563, 100.5018]} zoom={6} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {locations.features.map((feature, index) => {
                            const isVisitor = feature.properties.type === 'visitor_province';
                            const color = isVisitor ? 'orange' : 'red';
                            return (
                                <CircleMarker
                                    key={index}
                                    center={[
                                        feature.geometry.coordinates[1], // Lat
                                        feature.geometry.coordinates[0]  // Lng
                                    ]}
                                    pathOptions={{
                                        color: color,
                                        fillColor: color
                                    }}
                                    radius={Math.min(50, Math.max(5, feature.properties.count * 2))}
                                >
                                    <Popup>
                                        <div className="text-center">
                                            <h3 className="font-bold">{feature.properties.province}</h3>
                                            <p>{feature.properties.count} {isVisitor ? 'Visitors' : 'Orders'}</p>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            );
                        })}
                    </MapContainer>
                </div>
            )}
        </div>
    );
}
