'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Pencil, Trash2, Loader2, Check, FolderOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { categoryApi } from '@/services/api';

interface Category {
    id: string;
    name: string;
    description?: string;
    productCount: number;
}

interface CategoryManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCategoryChange?: () => void;
}

export function CategoryManagerModal({
    isOpen,
    onClose,
    onCategoryChange,
}: CategoryManagerModalProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [creating, setCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadCategories();
        }
    }, [isOpen]);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const data = await categoryApi.getAll();
            setCategories(data);
        } catch (error) {
            console.error('Error loading categories:', error);
            toast.error('Error al cargar categorías');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newCategoryName.trim()) return;

        try {
            setCreating(true);
            await categoryApi.create({ name: newCategoryName.trim() });
            toast.success('Categoría creada', {
                description: `"${newCategoryName}" agregada exitosamente`,
            });
            setNewCategoryName('');
            loadCategories();
            onCategoryChange?.();
        } catch (error: any) {
            toast.error('Error al crear categoría', {
                description: error.response?.data?.error || error.message,
            });
        } finally {
            setCreating(false);
        }
    };

    const handleUpdate = async (id: string) => {
        if (!editingName.trim()) return;

        try {
            await categoryApi.update(id, { name: editingName.trim() });
            toast.success('Categoría actualizada');
            setEditingId(null);
            setEditingName('');
            loadCategories();
            onCategoryChange?.();
        } catch (error: any) {
            toast.error('Error al actualizar', {
                description: error.response?.data?.error || error.message,
            });
        }
    };

    const handleDelete = async (category: Category) => {
        try {
            setDeletingId(category.id);
            const result = await categoryApi.delete(category.id);

            if (result.affectedProducts > 0) {
                toast.warning('Categoría eliminada', {
                    description: `${result.affectedProducts} productos ahora requieren atención`,
                });
            } else {
                toast.success('Categoría eliminada');
            }

            loadCategories();
            onCategoryChange?.();
        } catch (error: any) {
            toast.error('Error al eliminar', {
                description: error.response?.data?.error || error.message,
            });
        } finally {
            setDeletingId(null);
        }
    };

    const startEditing = (category: Category) => {
        setEditingId(category.id);
        setEditingName(category.name);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditingName('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', duration: 0.3 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[80vh] overflow-hidden"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl mx-4 flex flex-col max-h-[80vh]">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                                        <FolderOpen className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            Gestionar Categorías
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {categories.length} categorías
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                                    </div>
                                ) : categories.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>No hay categorías</p>
                                        <p className="text-sm">Crea la primera categoría abajo</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {categories.map((category) => (
                                            <div
                                                key={category.id}
                                                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                                            >
                                                {editingId === category.id ? (
                                                    <>
                                                        <input
                                                            type="text"
                                                            value={editingName}
                                                            onChange={(e) => setEditingName(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleUpdate(category.id);
                                                                if (e.key === 'Escape') cancelEditing();
                                                            }}
                                                            className="flex-1 px-3 py-2 rounded-lg border-2 border-green-500 focus:outline-none"
                                                            autoFocus
                                                        />
                                                        <button
                                                            onClick={() => handleUpdate(category.id)}
                                                            className="p-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={cancelEditing}
                                                            className="p-2 rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="flex-1 font-medium text-gray-900">
                                                            {category.name}
                                                        </span>
                                                        <span className="text-sm text-gray-500 px-2 py-1 bg-gray-200 rounded-full">
                                                            {category.productCount} productos
                                                        </span>
                                                        <button
                                                            onClick={() => startEditing(category)}
                                                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(category)}
                                                            disabled={deletingId === category.id}
                                                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                                                        >
                                                            {deletingId === category.id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer - Create new */}
                            <div className="p-6 border-t bg-gray-50">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleCreate();
                                        }}
                                        placeholder="Nueva categoría..."
                                        className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all outline-none"
                                    />
                                    <button
                                        onClick={handleCreate}
                                        disabled={creating || !newCategoryName.trim()}
                                        className="px-4 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {creating ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Plus className="w-5 h-5" />
                                        )}
                                        Crear
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
