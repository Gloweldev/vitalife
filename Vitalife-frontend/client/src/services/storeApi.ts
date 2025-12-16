import { Product, ProductsResponse, Category } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Store API service for public frontend
 * Uses native fetch with Next.js caching strategies
 */

/**
 * Fetch featured products for home page carousel
 * Uses ISR with 1 hour revalidation
 */
export async function getFeaturedProducts(): Promise<Product[]> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/store/products?featured=true&limit=8`,
            {
                next: { revalidate: 30 }, // 1 hour ISR
            }
        );

        if (!response.ok) {
            console.error('Failed to fetch featured products:', response.status);
            return [];
        }

        const data: ProductsResponse = await response.json();
        return data.products;
    } catch (error) {
        console.error('Error fetching featured products:', error);
        return []; // Graceful fallback
    }
}

/**
 * Fetch all products with optional filters
 * Uses ISR with 5 minute revalidation
 */
export async function getProducts(options?: {
    page?: number;
    limit?: number;
    categoryId?: string;
}): Promise<ProductsResponse> {
    try {
        const params = new URLSearchParams();

        if (options?.page) params.set('page', options.page.toString());
        if (options?.limit) params.set('limit', options.limit.toString());
        if (options?.categoryId) params.set('category', options.categoryId);

        const response = await fetch(
            `${API_BASE_URL}/store/products?${params.toString()}`,
            {
                next: { revalidate: 30 }, // 5 minute ISR
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        return {
            products: [],
            pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        };
    }
}

/**
 * Search products - no caching for real-time results
 */
export async function searchProducts(
    query: string,
    categoryId?: string
): Promise<Product[]> {
    try {
        const params = new URLSearchParams();

        if (query.trim()) {
            params.set('search', query.trim());
        }
        if (categoryId && categoryId !== 'all') {
            params.set('category', categoryId);
        }

        const response = await fetch(
            `${API_BASE_URL}/store/products?${params.toString()}`,
            {
                cache: 'no-store', // Real-time search
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data: ProductsResponse = await response.json();
        return data.products;
    } catch (error) {
        console.error('Error searching products:', error);
        return [];
    }
}

/**
 * Get single product by slug
 * Uses ISR with 5 minute revalidation
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/store/products/${slug}`,
            {
                next: { revalidate: 30 }, // 30 second ISR
            }
        );

        if (!response.ok) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}

/**
 * Get all categories for filtering
 * Uses ISR with 5 minute revalidation
 */
export async function getCategories(): Promise<Category[]> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/store/categories`,
            {
                next: { revalidate: 300 }, // 5 minute ISR
            }
        );

        if (!response.ok) {
            return [];
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}
