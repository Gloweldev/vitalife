import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/siteConfig';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ProductForSitemap {
    slug: string;
    flavors?: string[];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = siteConfig.url;

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/productos`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/mi-lista`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.5,
        },
    ];

    // Dynamic product pages
    const productPages: MetadataRoute.Sitemap = [];

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(`${API_BASE_URL}/store/products?limit=100`, {
            cache: 'no-store',
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
            },
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            const products: ProductForSitemap[] = data.products || [];

            for (const product of products) {
                if (!product.slug) continue;

                // Main product page
                productPages.push({
                    url: `${baseUrl}/productos/${product.slug}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly',
                    priority: 0.8,
                });

                // Flavor variant URLs for SEO
                if (product.flavors && product.flavors.length > 0) {
                    for (const flavor of product.flavors) {
                        const flavorSlug = flavor
                            .toLowerCase()
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                            .replace(/[^a-z0-9\s]/g, '')
                            .replace(/\s+/g, '-');

                        productPages.push({
                            url: `${baseUrl}/productos/${product.slug}?sabor=${encodeURIComponent(flavorSlug)}`,
                            lastModified: new Date(),
                            changeFrequency: 'weekly',
                            priority: 0.7,
                        });
                    }
                }
            }
        }
    } catch (error) {
        console.error('[Sitemap] Error:', error);
    }

    return [...staticPages, ...productPages];
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
