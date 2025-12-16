'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Loader2, ChevronDown } from 'lucide-react';
import { categoryApi } from '@/services/api';

interface Category {
    id: string;
    name: string;
    productCount?: number;
}

interface CategorySelectorProps {
    selectedCategoryId: string | null;
    onChange: (categoryId: string | null) => void;
}

export function CategorySelector({ selectedCategoryId, onChange }: CategorySelectorProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [inputValue, setInputValue] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const data = await categoryApi.getAll();
            setCategories(data);
        } catch (error) {
            console.error('Error loading categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const selectedCategory = categories.find(c => c.id === selectedCategoryId);

    const filteredCategories = categories.filter(
        cat => cat.name.toLowerCase().includes(inputValue.toLowerCase())
    );

    const handleSelect = (categoryId: string) => {
        onChange(categoryId);
        setInputValue('');
        setShowDropdown(false);
    };

    const handleCreateAndSelect = async () => {
        if (!inputValue.trim()) return;

        try {
            setCreating(true);
            const newCategory = await categoryApi.create({ name: inputValue.trim() });
            setCategories([...categories, newCategory]);
            onChange(newCategory.id);
            setInputValue('');
            setShowDropdown(false);
        } catch (error: any) {
            console.error('Error creating category:', error);
        } finally {
            setCreating(false);
        }
    };

    const handleRemove = () => {
        onChange(null);
    };

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Cargando categorías...</span>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Selected Category */}
            {selectedCategory && (
                <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-lg font-medium text-sm">
                        {selectedCategory.name}
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </span>
                </div>
            )}

            {/* Input / Dropdown */}
            {!selectedCategory && (
                <div className="relative">
                    <div className="relative">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => {
                                setInputValue(e.target.value);
                                setShowDropdown(true);
                            }}
                            onFocus={() => setShowDropdown(true)}
                            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                            placeholder="Buscar o crear categoría..."
                            className="w-full px-4 py-3 pr-10 rounded-xl border-2 border-gray-200 focus:border-green-600 focus:ring-4 focus:ring-green-100 transition-all outline-none"
                        />
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>

                    {/* Dropdown */}
                    {showDropdown && (
                        <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                            {filteredCategories.length > 0 ? (
                                filteredCategories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => handleSelect(cat.id)}
                                        className="w-full px-4 py-3 text-left hover:bg-green-50 transition-colors flex items-center justify-between"
                                    >
                                        <span className="text-gray-900">{cat.name}</span>
                                        {cat.productCount !== undefined && (
                                            <span className="text-xs text-gray-500">
                                                {cat.productCount} productos
                                            </span>
                                        )}
                                    </button>
                                ))
                            ) : inputValue.trim() ? (
                                <button
                                    type="button"
                                    onClick={handleCreateAndSelect}
                                    disabled={creating}
                                    className="w-full px-4 py-3 text-left hover:bg-green-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {creating ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                                    ) : (
                                        <Plus className="w-4 h-4 text-green-600" />
                                    )}
                                    <span className="text-gray-900">
                                        Crear <span className="font-semibold">"{inputValue}"</span>
                                    </span>
                                </button>
                            ) : (
                                <div className="px-4 py-3 text-gray-500 text-sm">
                                    No hay categorías. Escribe para crear una.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <p className="text-sm text-gray-500">
                💡 Selecciona una categoría o crea una nueva escribiendo su nombre.
            </p>
        </div>
    );
}
