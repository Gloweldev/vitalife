'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MessageCircle, Check, Plus } from 'lucide-react';
import { Product } from '@/types/product';

interface ProductDetailViewProps {
    product: Product;
    onAddToList?: (product: Product, flavor?: string) => void;
    onRemoveFromList?: (productId: string, flavor?: string) => void;
    isInList?: (productId: string, flavor?: string) => boolean;
}

export function ProductDetailView({
    product,
    onAddToList,
    onRemoveFromList,
    isInList
}: ProductDetailViewProps) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedFlavor, setSelectedFlavor] = useState<string>('');

    const hasFlavors = product.flavors && product.flavors.length > 0;
    const inList = isInList ? isInList(product.id, selectedFlavor) : false;

    const handleToggleList = () => {
        if (!onAddToList || !onRemoveFromList) return;

        if (hasFlavors && !selectedFlavor) {
            alert('Por favor, selecciona un sabor antes de agregar a tu lista.');
            return;
        }

        if (inList) {
            onRemoveFromList(product.id, hasFlavors ? selectedFlavor : undefined);
        } else {
            onAddToList(product, hasFlavors ? selectedFlavor : undefined);
        }
    };

    return (
        <div className="space-y-8">
            {/* Image Gallery */}
            <div>
                {/* Main Image */}
                <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 shadow-2xl mb-4">
                    <div className="absolute inset-0 p-8">
                        {product.images && product.images.length > 0 && product.images[0]?.url ? (
                            <Image
                                src={product.images[selectedImage]?.url || product.images[0].url}
                                alt={product.name}
                                fill
                                className="object-contain p-4"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full w-full">
                                <span className="text-gray-400">Sin imagen</span>
                            </div>
                        )}
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-6 right-6">
                        <span className="bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-xl backdrop-blur-sm">
                            {product.category}
                        </span>
                    </div>
                </div>

                {/* Thumbnail Gallery */}
                {product.images && product.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-3">
                        {product.images.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedImage(index)}
                                className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-300 ${selectedImage === index
                                    ? 'ring-4 ring-green-600 scale-105'
                                    : 'ring-2 ring-gray-200 hover:ring-green-400 opacity-70 hover:opacity-100'
                                    }`}
                            >
                                {image?.url && (
                                    <Image
                                        src={image.url}
                                        alt={`${product.name} - imagen ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="100px"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
                {/* Product Name */}
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                    {product.name}
                </h1>

                {/* Flavor Selector */}
                {hasFlavors && (
                    <div>
                        <label className="block text-lg font-semibold text-gray-900 mb-3">
                            Selecciona tu Sabor <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {product.flavors!.map((flavor) => (
                                <button
                                    key={flavor.id || flavor.name}
                                    onClick={() => setSelectedFlavor(flavor.name)}
                                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${selectedFlavor === flavor.name
                                        ? 'bg-green-600 text-white shadow-lg scale-105'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                                        }`}
                                >
                                    {flavor.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Full Description */}
                <div className="prose prose-lg max-w-none">
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {product.fullDescription}
                    </div>
                </div>

                {/* Benefits Section */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Beneficios Principales
                    </h2>
                    <ul className="space-y-3">
                        {product.benefits.map((benefit, index) => (
                            <li key={benefit.id || index} className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mt-0.5">
                                    <Check className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-gray-700 text-lg">{benefit.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Action Buttons (Only show if handlers provided) */}
                {(onAddToList && onRemoveFromList) && (
                    <div className="space-y-4 pt-6 border-t border-gray-200">
                        <button
                            onClick={handleToggleList}
                            disabled={hasFlavors && !selectedFlavor}
                            className={`w-full inline-flex items-center justify-center gap-3 px-8 py-5 text-lg font-bold rounded-xl border-2 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${inList
                                ? 'bg-green-50 border-green-600 text-green-700 hover:bg-green-100'
                                : 'bg-white border-gray-300 text-gray-700 hover:border-green-600 hover:text-green-600 hover:bg-gray-50'
                                }`}
                        >
                            {inList ? (
                                <>
                                    <Check className="w-6 h-6" />
                                    <span>En Mi Lista</span>
                                </>
                            ) : (
                                <>
                                    <Plus className="w-6 h-6" />
                                    <span>Agregar a Mi Lista</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
