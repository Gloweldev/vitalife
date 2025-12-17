'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, Package } from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';
import { useEffect, useState } from 'react';

// Content block types matching backend
interface ContentBlock {
    type: 'text' | 'heading' | 'image' | 'product' | 'paragraph' | 'list' | 'product-widget';
    content?: string;
    text?: string;
    url?: string;
    alt?: string;
    caption?: string;
    productId?: string;
    level?: 1 | 2 | 3;
    items?: string[];
}

interface PostRendererProps {
    content: ContentBlock[];
}

export function PostRenderer({ content }: PostRendererProps) {
    if (!content || !Array.isArray(content)) {
        return null;
    }

    return (
        <div className="prose prose-lg prose-gray max-w-none">
            {content.map((block, index) => (
                <RenderBlock key={index} block={block} />
            ))}
        </div>
    );
}

function RenderBlock({ block }: { block: ContentBlock }) {
    switch (block.type) {
        case 'text':
        case 'paragraph':
            return (
                <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                    {block.text || block.content}
                </p>
            );

        case 'heading':
            const level = block.level || 2;
            const headingText = block.text || block.content;
            const headingClasses = {
                1: 'text-3xl mt-12 mb-6',
                2: 'text-2xl mt-10 mb-4',
                3: 'text-xl mt-8 mb-3',
            };
            const className = `text-gray-900 font-bold ${headingClasses[level as 1 | 2 | 3] || headingClasses[2]}`;

            if (level === 1) {
                return <h1 className={className}>{headingText}</h1>;
            } else if (level === 3) {
                return <h3 className={className}>{headingText}</h3>;
            }
            return <h2 className={className}>{headingText}</h2>;

        case 'image':
            const imageUrl = block.url;
            const imageAlt = block.alt || block.caption || block.content || 'Imagen del artículo';
            const imageCaption = block.caption || block.content;

            if (!imageUrl) return null;

            return (
                <figure className="my-8">
                    <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
                        <Image
                            src={imageUrl}
                            alt={imageAlt}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 800px"
                        />
                    </div>
                    {imageCaption && (
                        <figcaption className="text-center text-sm text-gray-500 mt-3 italic">
                            {imageCaption}
                        </figcaption>
                    )}
                </figure>
            );

        case 'list':
            return (
                <ul className="list-disc list-inside space-y-2 mb-6 pl-4">
                    {block.items?.map((item, i) => (
                        <li key={i} className="text-gray-700 text-lg">
                            {item}
                        </li>
                    ))}
                </ul>
            );

        case 'product':
        case 'product-widget':
            return <BlogProductWidget productId={block.productId || ''} />;

        default:
            console.warn('Unknown block type:', block.type);
            return null;
    }
}

// Product preview type
interface ProductPreview {
    id: string;
    name: string;
    slug: string;
    shortDescription?: string;
    category?: string | null;
    image?: string | null;
}

/**
 * Blog Product Widget - Fetches product data from API
 * Client-side component that fetches product preview data
 */
function BlogProductWidget({ productId }: { productId: string }) {
    const [product, setProduct] = useState<ProductPreview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!productId) {
            setLoading(false);
            setError(true);
            return;
        }

        const fetchProduct = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                const response = await fetch(`${API_URL}/store/posts/product-preview/${productId}`);

                if (!response.ok) {
                    throw new Error('Product not found');
                }

                const data = await response.json();
                setProduct(data);
            } catch (err) {
                console.error('Error fetching product preview:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    // Loading state
    if (loading) {
        return (
            <div className="not-prose my-8 bg-gray-50 border border-gray-200 rounded-2xl p-6 animate-pulse">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-32 h-32 bg-gray-200 rounded-xl" />
                    <div className="flex-1 space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4" />
                        <div className="h-6 bg-gray-200 rounded w-3/4" />
                        <div className="h-10 bg-gray-200 rounded w-1/2" />
                    </div>
                </div>
            </div>
        );
    }

    // Error or no product
    if (error || !product) {
        return null;
    }

    const whatsappMessage = `Hola, vi el producto ${product.name} en el blog y me gustaría más información.`;
    const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    return (
        <div className="not-prose my-8 bg-gradient-to-r from-gray-50 to-green-50 border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Product Image */}
                <div className="relative w-32 h-32 flex-shrink-0">
                    <div className="absolute inset-0 bg-white rounded-xl shadow-md overflow-hidden">
                        {product.image ? (
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="128px"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <Package className="w-10 h-10 text-gray-300" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Product Info */}
                <div className="flex-1 text-center sm:text-left">
                    <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                        Producto Recomendado
                    </span>
                    <h4 className="text-xl font-bold text-gray-900 mt-1 mb-2">
                        {product.name}
                    </h4>
                    {product.shortDescription && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {product.shortDescription}
                        </p>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            href={`/productos/${product.slug}`}
                            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-full bg-white text-green-600 border-2 border-green-600 hover:bg-green-50 transition-all duration-300"
                        >
                            Ver Producto
                        </Link>
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full bg-[#25D366] text-white hover:bg-[#20BA5A] transition-all duration-300"
                        >
                            <MessageCircle className="w-4 h-4" />
                            Cotizar Producto
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
