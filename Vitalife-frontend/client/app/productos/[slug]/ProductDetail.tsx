'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { siteConfig } from '@/lib/siteConfig';
import { useList } from '@/context/ListContext';
import { MessageCircle, Check, Plus, ArrowLeft } from 'lucide-react';
import { Product } from '@/types';

interface ProductDetailProps {
    product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
    const { addToList, removeFromList, isInList } = useList();

    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedFlavor, setSelectedFlavor] = useState<string>('');

    const hasFlavors = product.flavors && product.flavors.length > 0;
    const inList = hasFlavors
        ? isInList(product.id, selectedFlavor)
        : isInList(product.id);

    const whatsappMessage = hasFlavors && selectedFlavor
        ? `Hola, me interesa detalles sobre ${product.name} (Sabor: ${selectedFlavor}). Me gustaría una cotización personalizada.`
        : `Hola, me interesa detalles sobre ${product.name}. Me gustaría una cotización personalizada.`;
    const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    const handleToggleList = () => {
        if (hasFlavors && !selectedFlavor) {
            alert('Por favor, selecciona un sabor antes de agregar a tu lista.');
            return;
        }

        if (inList) {
            removeFromList(product.id, hasFlavors ? selectedFlavor : undefined);
        } else {
            addToList(product, hasFlavors ? selectedFlavor : undefined);
        }
    };

    return (
        <main className="min-h-screen bg-white">
            {/* Breadcrumb */}
            <div className="border-b border-gray-200 bg-gray-50">
                <div className="container mx-auto px-4 py-4">
                    <Link
                        href="/productos"
                        className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al Catálogo
                    </Link>
                </div>
            </div>

            {/* Product Detail Section */}
            <section className="container mx-auto px-4 py-12 md:py-20">
                <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
                    {/* Left Column - Image Gallery */}
                    <div className="order-2 md:order-1">
                        <div className="sticky top-8">
                            {/* Main Image */}
                            <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 shadow-2xl mb-4">
                                <div className="absolute inset-0 p-8">
                                    <Image
                                        src={product.images[selectedImage]}
                                        alt={product.name}
                                        fill
                                        className="object-contain p-4"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        priority
                                        unoptimized
                                    />
                                </div>

                                {/* Category Badge */}
                                <div className="absolute top-6 right-6">
                                    <span className="bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-xl backdrop-blur-sm">
                                        {product.category}
                                    </span>
                                </div>
                            </div>

                            {/* Thumbnail Gallery */}
                            {product.images.length > 1 && (
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
                                            <Image
                                                src={image}
                                                alt={`${product.name} - imagen ${index + 1}`}
                                                fill
                                                className="object-cover"
                                                sizes="100px"
                                                unoptimized
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Information */}
                    <div className="order-1 md:order-2">
                        <div className="space-y-8">
                            {/* Product Name */}
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                                    {product.name}
                                </h1>
                            </div>

                            {/* Flavor Selector */}
                            {hasFlavors && (
                                <div>
                                    <label className="block text-lg font-semibold text-gray-900 mb-3">
                                        Selecciona tu Sabor <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {product.flavors!.map((flavor) => (
                                            <button
                                                key={flavor}
                                                onClick={() => setSelectedFlavor(flavor)}
                                                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${selectedFlavor === flavor
                                                    ? 'bg-green-600 text-white shadow-lg scale-105'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                                                    }`}
                                            >
                                                {flavor}
                                            </button>
                                        ))}
                                    </div>
                                    {!selectedFlavor && (
                                        <p className="text-sm text-gray-500 mt-2">
                                            Debes seleccionar un sabor para agregarlo a tu lista
                                        </p>
                                    )}
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
                                        <li key={index} className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mt-0.5">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="text-gray-700 text-lg">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-4 pt-6 border-t border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    ¿Interesado en este producto?
                                </h3>

                                {/* Primary: WhatsApp Button */}
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group/whatsapp w-full inline-flex items-center justify-center gap-3 px-8 py-5 text-lg font-bold rounded-xl bg-[#25D366] text-white hover:bg-[#20BA5A] transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                                >
                                    <MessageCircle className="w-6 h-6 group-hover/whatsapp:scale-110 transition-transform" />
                                    <span>Cotizar Personalizado</span>
                                </a>

                                {/* Secondary: Add/Remove from List Button */}
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

                            {/* Compliance Note */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    <span className="font-semibold text-gray-900">Nota:</span> Los productos Herbalife se adquieren a través de Distribuidores Independientes.
                                    Contacta con nosotros para obtener una cotización personalizada según tus objetivos de bienestar.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Related Products or CTA Section */}
            <section className="bg-gradient-to-b from-white to-gray-50 border-t border-gray-200">
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            ¿Necesitas Ayuda para Elegir?
                        </h2>
                        <p className="text-xl text-gray-600 mb-8">
                            Nuestro equipo está listo para asesorarte y crear un plan personalizado para tus objetivos.
                        </p>
                        <Link
                            href="/productos"
                            className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full bg-white text-green-600 border-2 border-green-600 hover:bg-green-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            Ver Más Productos
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
