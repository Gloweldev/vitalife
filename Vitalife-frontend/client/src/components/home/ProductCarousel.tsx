'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { useCallback } from 'react';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { ProductCard } from '../ui/ProductCard';
import { Product } from '@/types';

interface ProductCarouselProps {
    products: Product[];
}

export function ProductCarousel({ products }: ProductCarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'start',
        loop: false,
        slidesToScroll: 1,
        breakpoints: {
            '(min-width: 640px)': { slidesToScroll: 1 },
            '(min-width: 768px)': { slidesToScroll: 2 },
            '(min-width: 1024px)': { slidesToScroll: 3 },
        },
    });

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Nuestros{' '}
                        <span className="bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">
                            Productos Premium
                        </span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Descubre nuestra selección de productos Herbalife con calidad garantizada
                        y respaldo científico para tu bienestar integral.
                    </p>
                </div>

                {/* Empty State */}
                {products.length === 0 ? (
                    <div className="text-center py-16">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No hay productos disponibles en este momento.</p>
                        <p className="text-gray-400 text-sm mt-2">Vuelve pronto para ver nuestra selección.</p>
                    </div>
                ) : (
                    /* Carousel Container */
                    <div className="relative">
                        {/* Navigation Buttons */}
                        <button
                            onClick={scrollPrev}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-full bg-white shadow-xl hover:shadow-2xl flex items-center justify-center text-gray-700 hover:text-green-600 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Anterior"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        <button
                            onClick={scrollNext}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-full bg-white shadow-xl hover:shadow-2xl flex items-center justify-center text-gray-700 hover:text-green-600 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Siguiente"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>

                        {/* Embla Viewport */}
                        <div className="overflow-hidden" ref={emblaRef}>
                            <div className="flex gap-6">
                                {products.map((product) => (
                                    <div
                                        key={product.id}
                                        className="flex-none w-full sm:w-1/2 md:w-1/2 lg:w-1/3 xl:w-1/4"
                                    >
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* View All Link */}
                <div className="text-center mt-12">
                    <a
                        href="/productos"
                        className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full border-2 border-green-600 text-green-600 hover:bg-green-50 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                        Ver Catálogo Completo
                    </a>
                </div>
            </div>
        </section>
    );
}
