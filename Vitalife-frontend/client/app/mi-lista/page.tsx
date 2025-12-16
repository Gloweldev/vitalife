'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useList } from '@/context/ListContext';
import { siteConfig } from '@/lib/siteConfig';
import { ShoppingBag, Trash2, Plus, Minus, MessageCircle, ArrowLeft } from 'lucide-react';

export default function MiListaPage() {
    const { items, updateQuantity, removeFromList, clearList, totalItems } = useList();
    const [isSending, setIsSending] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Wait for client-side hydration to complete
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleQuantityChange = (productId: string, newQuantity: number, flavor?: string) => {
        if (newQuantity >= 1) {
            updateQuantity(productId, newQuantity, flavor);
        }
    };

    const handleSendWhatsApp = () => {
        if (items.length === 0) return;

        setIsSending(true);

        // Build WhatsApp message
        let message = 'Hola, quisiera cotizar la siguiente lista de productos:\n\n';

        items.forEach(item => {
            const productName = item.flavor
                ? `${item.product.name} (Sabor: ${item.flavor})`
                : item.product.name;
            message += `- ${item.quantity}x ${productName}\n`;
        });

        message += '\nEspero su respuesta, gracias.';

        // Encode message for URL
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodedMessage}`;

        // Open WhatsApp in new window
        window.open(whatsappUrl, '_blank');

        setIsSending(false);
    };

    // Show loading skeleton during SSR and initial client render
    if (!isMounted) {
        return (
            <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-2xl mx-auto">
                        <div className="animate-pulse space-y-4">
                            <div className="h-12 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    // Empty State
    if (items.length === 0) {
        return (
            <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="mb-8">
                            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                Tu lista está vacía
                            </h1>
                            <p className="text-xl text-gray-600 mb-8">
                                Agrega productos desde nuestro catálogo para crear tu lista de cotización personalizada.
                            </p>
                        </div>

                        <Link
                            href="/productos"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold rounded-full bg-green-600 text-white hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            Ir al Catálogo
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    // List with Items
    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Header Section */}
            <section className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-12">
                    <Link
                        href="/productos"
                        className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Seguir Comprando
                    </Link>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                                Mi Lista de Cotización
                            </h1>
                            <p className="text-lg text-gray-600">
                                {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'} en tu lista
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Items List */}
            <section className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        {/* List Header - Desktop Only */}
                        <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700 text-sm">
                            <div className="col-span-6">Producto</div>
                            <div className="col-span-3 text-center">Cantidad</div>
                            <div className="col-span-3 text-right">Acciones</div>
                        </div>

                        {/* Items */}
                        <div className="divide-y divide-gray-200">
                            {items.map((item) => (
                                <div
                                    key={item.product.id}
                                    className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 hover:bg-gray-50 transition-colors"
                                >
                                    {/* Product Info */}
                                    <div className="md:col-span-6 flex gap-4">
                                        {/* Thumbnail */}
                                        <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 relative rounded-xl overflow-hidden bg-gray-100">
                                            <Image
                                                src={item.product.images[0]}
                                                alt={item.product.name}
                                                fill
                                                className="object-cover"
                                                sizes="96px"
                                            />
                                        </div>

                                        {/* Name & Category */}
                                        <div className="flex-1 min-w-0">
                                            <Link
                                                href={`/productos/${item.product.id}`}
                                                className="block"
                                            >
                                                <h3 className="text-lg font-bold text-gray-900 hover:text-green-600 transition-colors line-clamp-2">
                                                    {item.product.name}
                                                    {item.flavor && (
                                                        <span className="text-green-600"> ({item.flavor})</span>
                                                    )}
                                                </h3>
                                            </Link>
                                            <p className="text-sm text-gray-500 mt-1">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {item.product.category}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quantity Selector */}
                                    <div className="md:col-span-3 flex items-center justify-center">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleQuantityChange(item.product.id, item.quantity - 1, item.flavor)}
                                                className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-gray-300 hover:border-green-600 hover:text-green-600 transition-all"
                                                aria-label="Disminuir cantidad"
                                            >
                                                <Minus className="w-5 h-5" />
                                            </button>

                                            <div className="w-16 text-center">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value);
                                                        if (!isNaN(val) && val >= 1) {
                                                            handleQuantityChange(item.product.id, val, item.flavor);
                                                        }
                                                    }}
                                                    className="w-full text-center text-xl font-bold text-gray-900 border-0 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-lg py-2"
                                                />
                                            </div>

                                            <button
                                                onClick={() => handleQuantityChange(item.product.id, item.quantity + 1, item.flavor)}
                                                className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-gray-300 hover:border-green-600 hover:text-green-600 transition-all"
                                                aria-label="Aumentar cantidad"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Delete Button */}
                                    <div className="md:col-span-3 flex items-center justify-end">
                                        <button
                                            onClick={() => removeFromList(item.product.id, item.flavor)}
                                            className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                            <span className="font-medium">Eliminar</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Summary & Checkout Section */}
            <section className="bg-gray-50 border-t border-gray-200 py-12">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            {/* Summary */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                    Resumen de Cotización
                                </h2>

                                <div className="space-y-3 text-gray-700">
                                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                                        <span className="text-lg">Total de Artículos:</span>
                                        <span className="text-2xl font-bold text-green-600">
                                            {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
                                        </span>
                                    </div>

                                    <div className="text-sm text-gray-600 bg-green-50 p-4 rounded-lg">
                                        <p className="font-medium text-green-900 mb-2">
                                            💡 Sin precios públicos
                                        </p>
                                        <p>
                                            Como Distribuidor Independiente de Herbalife, te proporcionaré una cotización
                                            personalizada basada en tus objetivos y necesidades específicas.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* WhatsApp Checkout Button */}
                            <button
                                onClick={handleSendWhatsApp}
                                disabled={isSending}
                                className="w-full group inline-flex items-center justify-center gap-3 px-8 py-6 text-xl font-bold rounded-xl bg-[#25D366] text-white hover:bg-[#20BA5A] transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
                                <span>
                                    {isSending ? 'Enviando...' : 'Solicitar Cotización por WhatsApp'}
                                </span>
                            </button>

                            <p className="text-center text-sm text-gray-500 mt-4">
                                Al hacer clic, se abrirá WhatsApp con tu lista preparada
                            </p>

                            {/* Optional: Clear List Button */}
                            <button
                                onClick={() => {
                                    if (confirm('¿Estás seguro de que quieres vaciar tu lista?')) {
                                        clearList();
                                    }
                                }}
                                className="w-full mt-4 px-6 py-3 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                Vaciar Lista
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
