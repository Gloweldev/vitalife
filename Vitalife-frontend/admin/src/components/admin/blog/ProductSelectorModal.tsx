'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Search, Package, Loader2 } from 'lucide-react';
import { productApi } from '@/services/api';

// Product type from API
interface ProductImage {
    id: string;
    url: string;
    isMain: boolean;
}

interface Product {
    id: string;
    name: string;
    shortDescription?: string;
    images: ProductImage[];
    category?: {
        id: string;
        name: string;
    };
}

interface ProductSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (product: { id: string; name: string; image: string }) => void;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}

export function ProductSelectorModal({ isOpen, onClose, onSelect }: ProductSelectorModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    // Debounce search query (400ms)
    const debouncedSearch = useDebounce(searchQuery, 400);

    // Fetch products from API
    const fetchProducts = useCallback(async (search?: string) => {
        try {
            setLoading(true);
            const data = await productApi.getAll({ search: search || undefined });
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
            setInitialLoad(false);
        }
    }, []);

    // Load products when modal opens
    useEffect(() => {
        if (isOpen && initialLoad) {
            fetchProducts();
        }
    }, [isOpen, initialLoad, fetchProducts]);

    // Fetch products when debounced search changes
    useEffect(() => {
        if (isOpen && !initialLoad) {
            fetchProducts(debouncedSearch);
        }
    }, [debouncedSearch, isOpen, initialLoad, fetchProducts]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('');
            setInitialLoad(true);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSelect = (product: Product) => {
        onSelect({
            id: product.id,
            name: product.name,
            image: product.images?.[0]?.url || '',
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Package className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Insertar Producto
                            </h2>
                            <p className="text-sm text-gray-500">
                                Selecciona un producto para mostrar en el artículo
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar productos..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        {loading && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 animate-spin" />
                        )}
                    </div>
                </div>

                {/* Product List */}
                <div className="p-4 overflow-y-auto max-h-[400px]">
                    {loading && products.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            {debouncedSearch ? 'No se encontraron productos' : 'No hay productos disponibles'}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {products.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => handleSelect(product)}
                                    className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50/50 transition-all duration-200 text-left group"
                                >
                                    {/* Product Image */}
                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                        {product.images?.[0]?.url ? (
                                            <img
                                                src={product.images[0].url}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-6 h-6 text-gray-300" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 truncate group-hover:text-green-600 transition-colors">
                                            {product.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {product.category?.name || 'Sin categoría'}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-500 text-center">
                        El producto se mostrará como un widget interactivo en el artículo
                    </p>
                </div>
            </div>
        </div>
    );
}
