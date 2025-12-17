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
    // Get all products with optional search
    async getAll(params?: { search?: string; categoryId?: string }) {
        const response = await api.get('/products', { params });
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

    // Toggle product visibility
    async toggleVisibility(id: string, isActive: boolean) {
        const response = await api.patch(`/products/${id}/visibility`, { isActive });
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

// Post API for Blog
export interface PostData {
    title: string;
    slug?: string;
    excerpt?: string;
    coverImage?: string;
    content: ContentBlock[];
    category?: string;
    postType?: 'article' | 'recipe' | 'tip';
    status?: 'draft' | 'published';
    author?: string;
}

export interface ContentBlock {
    id?: string;
    type: 'text' | 'heading' | 'image' | 'product';
    content?: string;
    url?: string;
    caption?: string;
    level?: 2 | 3;
    productId?: string;
    productName?: string;
    productImage?: string;
    preview?: string; // Temporary preview URL for editor
}

export interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    coverImage?: string;
    content: ContentBlock[];
    categoryId?: string;
    category?: {
        id: string;
        name: string;
        slug: string;
    };
    postType: string;
    status: string;
    author?: string;
    readTime?: string;
    views: number;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export const postApi = {
    // Get all posts (admin list includes drafts)
    async getAll(params?: { page?: number; limit?: number; status?: string; category?: string }) {
        const response = await api.get('/posts/admin/list', { params });
        return response.data;
    },

    // Get public posts
    async getPublic(params?: { page?: number; limit?: number; category?: string }) {
        const response = await api.get('/posts', { params });
        return response.data;
    },

    // Get single post by ID (admin - includes drafts)
    async getById(id: string) {
        const response = await api.get(`/posts/admin/${id}`);
        return response.data;
    },

    // Get single post by slug (for public)
    async getBySlug(slug: string) {
        const response = await api.get(`/posts/${slug}`);
        return response.data;
    },

    // Create post
    async create(data: PostData) {
        // Clean content blocks - remove preview URLs before saving
        const cleanedData = {
            ...data,
            content: data.content.map(block => {
                const { preview, ...cleanBlock } = block as ContentBlock & { preview?: string };
                return cleanBlock;
            }),
        };
        const response = await api.post('/posts', cleanedData);
        return response.data;
    },

    // Update post
    async update(id: string, data: Partial<PostData>) {
        // Clean content blocks - remove preview URLs before saving
        const cleanedData = {
            ...data,
            content: data.content?.map(block => {
                const { preview, ...cleanBlock } = block as ContentBlock & { preview?: string };
                return cleanBlock;
            }),
        };
        const response = await api.put(`/posts/${id}`, cleanedData);
        return response.data;
    },

    // Delete post
    async delete(id: string) {
        const response = await api.delete(`/posts/${id}`);
        return response.data;
    },

    // Bulk update posts
    async bulkUpdate(postIds: string[], action: 'publish' | 'unpublish' | 'archive' | 'delete' | 'changeCategory', value?: string) {
        const response = await api.patch('/posts/bulk-update', { postIds, action, value });
        return response.data;
    },
};

// Blog Category API
export interface BlogCategory {
    id: string;
    name: string;
    slug: string;
    postCount: number;
    createdAt: string;
    updatedAt: string;
}

export const blogCategoryApi = {
    // Get all blog categories
    async getAll(): Promise<BlogCategory[]> {
        const response = await api.get('/blog/categories');
        return response.data;
    },

    // Create category
    async create(name: string): Promise<BlogCategory> {
        const response = await api.post('/blog/categories', { name });
        return response.data;
    },

    // Update category
    async update(id: string, name: string): Promise<BlogCategory> {
        const response = await api.put(`/blog/categories/${id}`, { name });
        return response.data;
    },

    // Delete category
    async delete(id: string): Promise<{ message: string; affectedPosts: number }> {
        const response = await api.delete(`/blog/categories/${id}`);
        return response.data;
    },
};

// Upload API for Blog Images
export const uploadApi = {
    // Upload blog content image
    async uploadBlogImage(file: File): Promise<{ key: string; previewUrl: string }> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/uploads/blog', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Upload post cover image
    async uploadPostCover(file: File): Promise<{ key: string; previewUrl: string }> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/uploads/post-cover', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Delete uploaded file
    async deleteFile(key: string) {
        const response = await api.delete('/uploads', { data: { key } });
        return response.data;
    },
};

export default api;
