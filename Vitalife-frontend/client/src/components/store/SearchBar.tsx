'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');

    // Debounce search input by 300ms
    const debouncedQuery = useDebounce(query, 300);

    // Update URL when debounced query changes
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());

        if (debouncedQuery.trim()) {
            params.set('q', debouncedQuery.trim());
        } else {
            params.delete('q');
        }

        // Only update if changed
        const newUrl = params.toString() ? `/productos?${params.toString()}` : '/productos';
        const currentUrl = searchParams.toString() ? `/productos?${searchParams.toString()}` : '/productos';

        if (newUrl !== currentUrl) {
            router.push(newUrl, { scroll: false });
        }
    }, [debouncedQuery, router, searchParams]);

    const handleClear = useCallback(() => {
        setQuery('');
    }, []);

    return (
        <div className="relative max-w-md w-full">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar productos..."
                    className="w-full pl-12 pr-12 py-4 text-base rounded-full border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 outline-none shadow-sm hover:shadow-md"
                />

                {/* Search Icon */}
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                {/* Clear Button */}
                {query && (
                    <button
                        onClick={handleClear}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Limpiar búsqueda"
                    >
                        <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    </button>
                )}
            </div>

            {/* Helper text */}
            {query && (
                <p className="absolute -bottom-6 left-4 text-xs text-gray-500">
                    Presiona Enter o espera para buscar...
                </p>
            )}
        </div>
    );
}
