import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000', // ชี้ไปที่ Backend ของเรา
    headers: {
        'Content-Type': 'application/json',
    },
});

// ตัวอย่างฟังก์ชันดึงสินค้า
export const getProducts = async () => {
    const response = await api.get('/products');
    return response.data;
};

export default api;