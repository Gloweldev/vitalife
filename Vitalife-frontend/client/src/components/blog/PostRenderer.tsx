'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ContentBlock } from '@/lib/mock-blog';
import { MessageCircle } from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';

interface PostRendererProps {
    content: ContentBlock[];
}

// Mock product data for the widget (in real app, fetch from API)
const mockProducts: Record<string, { name: string; image: string; slug: string }> = {
    '4dc14927-c8c7-4d0d-a6d4-d767d555c4be': {
        name: 'Formula 1 - Batido Nutricional',
        image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&q=80',
        slug: 'producto-1'
    }
};

export function PostRenderer({ content }: PostRendererProps) {
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
        case 'paragraph':
            return (
                <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                    {block.content}
                </p>
            );

        case 'heading':
            const HeadingTag = `h${block.level || 2}` as keyof JSX.IntrinsicElements;
            return (
                <HeadingTag className="text-gray-900 font-bold mt-10 mb-4">
                    {block.content}
                </HeadingTag>
            );

        case 'image':
            return (
                <figure className="my-8">
                    <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
                        <Image
                            src={block.url || ''}
                            alt={block.content || 'Imagen del artículo'}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 800px"
                        />
                    </div>
                    {block.content && (
                        <figcaption className="text-center text-sm text-gray-500 mt-3 italic">
                            {block.content}
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

        case 'product-widget':
            return <ProductWidget productId={block.productId || ''} />;

        default:
            return null;
    }
}

function ProductWidget({ productId }: { productId: string }) {
    const product = mockProducts[productId];

    if (!product) {
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
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="128px"
                        />
                    </div>
                </div>

                {/* Product Info */}
                <div className="flex-1 text-center sm:text-left">
                    <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                        Producto Recomendado
                    </span>
                    <h4 className="text-xl font-bold text-gray-900 mt-1 mb-3">
                        {product.name}
                    </h4>

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
