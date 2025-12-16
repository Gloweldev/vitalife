'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Plus, MessageCircle, Check } from 'lucide-react';
import { Product } from '@/types';
import { Button } from './Button';
import { siteConfig } from '@/lib/siteConfig';
import { useList } from '@/context/ListContext';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const { addToList, removeFromList, isInList } = useList();
    const inList = isInList(product.id);

    // Generate WhatsApp message with product name
    const whatsappMessage = `Hola, me interesa cotizar el producto: ${product.name}`;
    const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    const handleToggleList = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent Link navigation
        e.stopPropagation();

        if (inList) {
            removeFromList(product.id);
        } else {
            addToList(product);
        }
    };

    const handleWhatsAppClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent Link navigation
    };

    return (
        <Link href={`/productos/${product.slug}`} className="block">
            <div className="group bg-white rounded-3xl shadow-lg overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer">
                {/* Image Container with extra padding */}
                <div className="relative h-72 w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                    <div className="relative h-full w-full">
                        <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover rounded-2xl transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </div>

                    {/* Category Badge - Premium positioning */}
                    <div className="absolute top-6 right-6">
                        <span className="bg-gradient-to-r from-green-600 to-green-700 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
                            {product.category}
                        </span>
                    </div>
                </div>

                {/* Content with generous padding */}
                <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-snug group-hover:text-green-600 transition-colors">
                        {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                        {product.shortDescription}
                    </p>

                    {/* Premium Dual Button Layout */}
                    <div className="flex flex-col gap-3">
                        {/* Primary: WhatsApp Button - Prominent */}
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={handleWhatsAppClick}
                            className="group/whatsapp inline-flex items-center justify-center gap-3 px-6 py-4 text-base font-bold rounded-xl bg-[#25D366] text-white hover:bg-[#20BA5A] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <MessageCircle className="w-5 h-5 group-hover/whatsapp:scale-110 transition-transform" />
                            <span>Cotizar por WhatsApp</span>
                        </a>

                        {/* Secondary: Add to List Button - Toggle based on state */}
                        <button
                            onClick={handleToggleList}
                            className={`w-full inline-flex items-center justify-center gap-2 px-6 py-4 text-base font-bold rounded-xl border-2 transition-all duration-300 shadow-md hover:shadow-lg ${inList
                                ? 'bg-green-50 border-green-600 text-green-700 hover:bg-green-100'
                                : 'bg-white border-gray-300 text-gray-700 hover:border-green-600 hover:text-green-600 hover:bg-gray-50'
                                }`}
                        >
                            {inList ? (
                                <>
                                    <Check className="w-5 h-5" />
                                    <span>En Mi Lista</span>
                                </>
                            ) : (
                                <>
                                    <Plus className="w-5 h-5" />
                                    <span>Añadir a lista</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
}
