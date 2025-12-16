'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, Plus } from 'lucide-react';
import { Product } from '@/types/product';

interface ProductCardProps {
    product: Product;
    isPreview?: boolean; // For admin preview mode
}

export function ProductCard({ product, isPreview = false }: ProductCardProps) {
    const cardContent = (
        <>
            {/* Image Container */}
            <div className="relative h-72 w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                <div className="relative h-full w-full">
                    {product.images && product.images.length > 0 && product.images[0]?.url ? (
                        <Image
                            src={product.images[0].url}
                            alt={product.name}
                            fill
                            className="object-cover rounded-2xl transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full w-full bg-gray-200 rounded-2xl">
                            <span className="text-gray-400 text-sm">Sin imagen</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
                {/* Category Badge */}
                <div>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                        {product.category}
                    </span>
                </div>

                {/* Product Name */}
                <h3 className="text-xl font-bold text-gray-900 line-clamp-2 min-h-[3.5rem]">
                    {product.name}
                </h3>

                {/* Short Description */}
                <p className="text-gray-600 line-clamp-2 min-h-[3rem]">
                    {product.shortDescription}
                </p>

                {/* Action Buttons */}
                {!isPreview && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            className="group/whatsapp inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#25D366] text-white font-bold text-sm hover:bg-[#20BA5A] transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                            <MessageCircle className="w-4 h-4 group-hover/whatsapp:scale-110 transition-transform" />
                            <span>Cotizar</span>
                        </button>

                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-bold text-sm hover:border-green-600 hover:text-green-600 hover:bg-green-50 transition-all duration-300"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Lista</span>
                        </button>
                    </div>
                )}
            </div>
        </>
    );

    if (isPreview) {
        return (
            <div className="group block bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                {cardContent}
            </div>
        );
    }

    return (
        <Link
            href={`/productos/${product.id}`}
            className="group block bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
        >
            {cardContent}
        </Link>
    );
}
