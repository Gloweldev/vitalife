import { Suspense } from 'react';
import { Metadata } from 'next';
import { getProductBySlug } from '@/services/storeApi';
import { siteConfig } from '@/lib/siteConfig';
import { notFound } from 'next/navigation';
import { ProductDetail } from './ProductDetail';

interface ProductDetailPageProps {
    params: Promise<{ slug: string }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
        return {
            title: `Producto no encontrado | ${siteConfig.name}`,
        };
    }

    const title = `${product.name} | ${siteConfig.name} - ${siteConfig.distributorLabel}`;
    const description = product.shortDescription || siteConfig.defaultDescription;
    const productUrl = `${siteConfig.url}/productos/${slug}`;
    const productImage = product.images?.[0] || `${siteConfig.url}${siteConfig.ogImage}`;

    return {
        title,
        description,
        metadataBase: new URL(siteConfig.url),
        alternates: {
            canonical: productUrl,
        },
        openGraph: {
            title,
            description,
            url: productUrl,
            siteName: siteConfig.name,
            images: [
                {
                    url: productImage,
                    width: 800,
                    height: 800,
                    alt: product.name,
                },
            ],
            locale: 'es_MX',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [productImage],
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
    const { slug } = await params;

    // Fetch product from API by slug
    const product = await getProductBySlug(slug);

    if (!product) {
        notFound();
    }

    return (
        <Suspense fallback={<ProductDetailSkeleton />}>
            <ProductDetail product={product} />
        </Suspense>
    );
}

function ProductDetailSkeleton() {
    return (
        <main className="min-h-screen bg-white">
            <div className="border-b border-gray-200 bg-gray-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
                </div>
            </div>
            <section className="container mx-auto px-4 py-12 md:py-20">
                <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
                    <div className="aspect-square rounded-3xl bg-gray-200 animate-pulse" />
                    <div className="space-y-6">
                        <div className="w-3/4 h-12 bg-gray-200 rounded animate-pulse" />
                        <div className="w-full h-32 bg-gray-100 rounded animate-pulse" />
                        <div className="w-full h-48 bg-gray-100 rounded animate-pulse" />
                    </div>
                </div>
            </section>
        </main>
    );
}
