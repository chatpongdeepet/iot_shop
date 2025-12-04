import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const [products, setProducts] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProductId, setCurrentProductId] = useState(null);
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        images: [],
        category: ''
    });
    const [uploading, setUploading] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Basic protection
        if (!user || user.role !== 'admin') {
            // navigate('/'); 
        }
        fetchProducts();
    }, [user, navigate]);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products/');
            setProducts(response.data.items);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/products/${currentProductId}`, newProduct);
                setIsEditing(false);
                setCurrentProductId(null);
            } else {
                await api.post('/products/', newProduct);
            }
            setNewProduct({ name: '', description: '', price: '', stock: '', images: [], category: '' });
            fetchProducts();
        } catch (error) {
            alert(isEditing ? 'Failed to update product' : 'Failed to add product');
        }
    };

    const handleEdit = (product) => {
        setIsEditing(true);
        setCurrentProductId(product.id);
        setNewProduct({
            name: product.name,
            description: product.description || '',
            price: product.price,
            stock: product.stock,
            images: product.images || [],
            category: product.category || ''
        });
        // Scroll to top
        window.scrollTo(0, 0);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setCurrentProductId(null);
        setNewProduct({ name: '', description: '', price: '', stock: '', images: [], category: '' });
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure?')) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts();
            } catch (error) {
                alert('Failed to delete');
            }
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (newProduct.images.length >= 5) {
            alert('Maximum 5 images allowed');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const response = await api.post('/upload/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setNewProduct(prev => ({
                ...prev,
                images: [...prev.images, response.data.url]
            }));
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (indexToRemove) => {
        setNewProduct(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };

    return (
        <div className="container mx-auto lg:px-40 md:px-20 px-10">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        placeholder="Name"
                        value={newProduct.name}
                        onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                        className="p-2 border rounded"
                        required
                    />
                    <input
                        placeholder="Price"
                        type="number"
                        value={newProduct.price}
                        onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                        className="p-2 border rounded"
                        required
                    />
                    <input
                        placeholder="Stock"
                        type="number"
                        value={newProduct.stock}
                        onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                        className="p-2 border rounded"
                        required
                    />
                    <input
                        placeholder="Category"
                        value={newProduct.category}
                        onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                        className="p-2 border rounded"
                    />
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Images (Max 5)</label>
                        <div className="flex flex-wrap gap-4 mb-2">
                            {newProduct.images.map((url, index) => (
                                <div key={index} className="relative w-24 h-24">
                                    <img src={url} alt={`Product ${index}`} className="w-full h-full object-cover rounded" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                    >
                                        x
                                    </button>
                                </div>
                            ))}
                            {newProduct.images.length < 5 && (
                                <label className="w-24 h-24 flex items-center justify-center border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-gray-400">
                                    <span className="text-2xl text-gray-400">+</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        disabled={uploading}
                                    />
                                </label>
                            )}
                        </div>
                        {uploading && <p className="text-sm text-blue-500">Uploading...</p>}
                    </div>
                    <textarea
                        placeholder="Description"
                        value={newProduct.description}
                        onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                        className="p-2 border rounded md:col-span-2"
                    />
                    <div className="md:col-span-2 flex space-x-2">
                        <button type="submit" className={`flex-1 text-white py-2 rounded ${isEditing ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}>
                            {isEditing ? 'Update Product' : 'Add Product'}
                        </button>
                        {isEditing && (
                            <button type="button" onClick={handleCancelEdit} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{product.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap">฿{product.price}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{product.stock}</td>
                                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                    <button onClick={() => handleEdit(product)} className="text-yellow-600 hover:text-yellow-900">Edit</button>
                                    <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
