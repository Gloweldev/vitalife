'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Pencil, Trash2, Loader2, Tags, AlertTriangle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { blogCategoryApi, BlogCategory } from '@/services/api';

interface BlogCategoryManagerProps {
    isOpen: boolean;
    onClose: () => void;
    onCategoriesChange?: () => void;
}

export function BlogCategoryManager({ isOpen, onClose, onCategoriesChange }: BlogCategoryManagerProps) {
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [creating, setCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Load categories
    useEffect(() => {
        if (isOpen) {
            loadCategories();
        }
    }, [isOpen]);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const data = await blogCategoryApi.getAll();
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
            await blogCategoryApi.create(newCategoryName.trim());
            setNewCategoryName('');
            await loadCategories();
            onCategoriesChange?.();
            toast.success('Categoría creada');
        } catch (error: any) {
            console.error('Error creating category:', error);
            toast.error(error.response?.data?.error || 'Error al crear categoría');
        } finally {
            setCreating(false);
        }
    };

    const handleUpdate = async (id: string) => {
        if (!editingName.trim()) return;

        try {
            await blogCategoryApi.update(id, editingName.trim());
            setEditingId(null);
            setEditingName('');
            await loadCategories();
            onCategoriesChange?.();
            toast.success('Categoría actualizada');
        } catch (error: any) {
            console.error('Error updating category:', error);
            toast.error(error.response?.data?.error || 'Error al actualizar categoría');
        }
    };

    const handleDelete = async (category: BlogCategory) => {
        const hasWarning = category.postCount > 0;
        const message = hasWarning
            ? `⚠️ Esta categoría tiene ${category.postCount} post(s) asignados. Al eliminarla, estos posts quedarán sin categoría. ¿Continuar?`
            : `¿Eliminar la categoría "${category.name}"?`;

        if (!confirm(message)) return;

        try {
            setDeletingId(category.id);
            const result = await blogCategoryApi.delete(category.id);
            await loadCategories();
            onCategoriesChange?.();
            if (result.affectedPosts > 0) {
                toast.success(`Categoría eliminada. ${result.affectedPosts} posts actualizados.`);
            } else {
                toast.success('Categoría eliminada');
            }
        } catch (error: any) {
            console.error('Error deleting category:', error);
            toast.error(error.response?.data?.error || 'Error al eliminar categoría');
        } finally {
            setDeletingId(null);
        }
    };

    const startEdit = (category: BlogCategory) => {
        setEditingId(category.id);
        setEditingName(category.name);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingName('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Tags className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Categorías del Blog
                            </h2>
                            <p className="text-sm text-gray-500">
                                Gestiona las categorías de los artículos
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

                {/* Create New Category */}
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            placeholder="Nueva categoría..."
                            className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            disabled={creating}
                        />
                        <button
                            onClick={handleCreate}
                            disabled={creating || !newCategoryName.trim()}
                            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {creating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Plus className="w-4 h-4" />
                            )}
                            Crear
                        </button>
                    </div>
                </div>

                {/* Category List */}
                <div className="p-4 overflow-y-auto max-h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No hay categorías. Crea la primera arriba.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {categories.map((category) => (
                                <div
                                    key={category.id}
                                    className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                                >
                                    {editingId === category.id ? (
                                        <>
                                            <input
                                                type="text"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleUpdate(category.id);
                                                    if (e.key === 'Escape') cancelEdit();
                                                }}
                                                className="flex-1 px-3 py-1.5 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => handleUpdate(category.id)}
                                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 truncate">
                                                    {category.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {category.postCount} {category.postCount === 1 ? 'post' : 'posts'}
                                                </p>
                                            </div>

                                            {category.postCount > 0 && (
                                                <span className="flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 text-xs rounded-full">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    {category.postCount}
                                                </span>
                                            )}

                                            <button
                                                onClick={() => startEdit(category)}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category)}
                                                disabled={deletingId === category.id}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
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

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-500 text-center">
                        Las categorías organizan los artículos del blog
                    </p>
                </div>
            </div>
        </div>
    );
}
