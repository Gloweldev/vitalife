import axios from 'axios';
import { auth } from '@/lib/firebase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Automatically add Firebase token
api.interceptors.request.use(
    async (config) => {
        const user = auth.currentUser;

        if (user) {
            try {
                const token = await user.getIdToken(true); // Force refresh
                config.headers.Authorization = `Bearer ${token}`;
            } catch (error) {
                console.error('Error getting auth token:', error);
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle auth errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response) {
            const { status } = error.response;

            // Unauthorized - token invalid or expired
            if (status === 401 || status === 403) {
                console.error('Auth error, logging out');
                await auth.signOut();
                window.location.href = '/admin/login';
            }
        }

        return Promise.reject(error);
    }
);

// API Methods
export const productApi = {
    // Get all products
    async getAll() {
        const response = await api.get('/products');
        return response.data;
    },

    // Get single product
    async getById(id: string) {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    // Create product with images
    async create(formData: FormData) {
        const response = await api.post('/products', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Update product
    async update(id: string, formData: FormData) {
        const response = await api.put(`/products/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Delete product
    async delete(id: string) {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },

    // Bulk update category for multiple products
    async bulkUpdateCategory(productIds: string[], newCategoryId: string | null) {
        const response = await api.patch('/products/bulk-update', {
            productIds,
            newCategoryId,
        });
        return response.data;
    },
};

// Category API
export const categoryApi = {
    // Get all categories
    async getAll() {
        const response = await api.get('/categories');
        return response.data;
    },

    // Get single category
    async getById(id: string) {
        const response = await api.get(`/categories/${id}`);
        return response.data;
    },

    // Create category
    async create(data: { name: string; description?: string }) {
        const response = await api.post('/categories', data);
        return response.data;
    },

    // Update category
    async update(id: string, data: { name: string; description?: string }) {
        const response = await api.put(`/categories/${id}`, data);
        return response.data;
    },

    // Delete category
    async delete(id: string) {
        const response = await api.delete(`/categories/${id}`);
        return response.data;
    },
};

export default api;

