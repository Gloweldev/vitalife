import { NextResponse } from 'next/server';
import { siteConfig } from '@/lib/siteConfig';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ProductForSitemap {
    slug: string;
    flavors?: string[];
}

export async function GET() {
    const baseUrl = siteConfig.url;

    // Static pages
    const urls: Array<{ loc: string; priority: number; changefreq: string }> = [
        { loc: baseUrl, priority: 1, changefreq: 'weekly' },
        { loc: `${baseUrl}/productos`, priority: 0.9, changefreq: 'daily' },
        { loc: `${baseUrl}/mi-lista`, priority: 0.5, changefreq: 'weekly' },
    ];

    // Fetch products
    try {
        const response = await fetch(`${API_BASE_URL}/store/products?limit=100`, {
            cache: 'no-store',
        });

        if (response.ok) {
            const data = await response.json();
            const products: ProductForSitemap[] = data.products || [];

            for (const product of products) {
                if (!product.slug) continue;

                // Main product page
                urls.push({
                    loc: `${baseUrl}/productos/${product.slug}`,
                    priority: 0.8,
                    changefreq: 'weekly',
                });

                // Flavor variants
                if (product.flavors && product.flavors.length > 0) {
                    for (const flavor of product.flavors) {
                        const flavorSlug = flavor
                            .toLowerCase()
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                            .replace(/[^a-z0-9\s]/g, '')
                            .replace(/\s+/g, '-');

                        urls.push({
                            loc: `${baseUrl}/productos/${product.slug}?sabor=${encodeURIComponent(flavorSlug)}`,
                            priority: 0.7,
                            changefreq: 'weekly',
                        });
                    }
                }
            }
        }
    } catch (error) {
        console.error('[Sitemap] Error:', error);
    }

    // Generate XML
    const lastmod = new Date().toISOString();
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
    });
}

export const dynamic = 'force-dynamic';
