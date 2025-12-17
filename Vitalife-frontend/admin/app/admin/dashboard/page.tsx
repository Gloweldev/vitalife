'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Plus, Package, Edit, Trash2, Star, TrendingUp, Layers, LogOut,
    FolderOpen, AlertTriangle, Filter, CheckSquare, Square, X, Loader2, Search, Eye, EyeOff
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { productApi, categoryApi } from '@/services/api';
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal';
import { CategoryManagerModal } from '@/components/admin/CategoryManagerModal';
import { AdminShell } from '@/components/admin/AdminShell';

interface Category {
    id: string;
    name: string;
    productCount: number;
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

export default function DashboardPage() {
    const { user, signOut } = useAuth();
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [visibilityFilter, setVisibilityFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [togglingVisibility, setTogglingVisibility] = useState<string | null>(null);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [bulkAssignOpen, setBulkAssignOpen] = useState(false);
    const [bulkAssigning, setBulkAssigning] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [creatingCategory, setCreatingCategory] = useState(false);

    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; productId: string; productName: string }>({
        isOpen: false,
        productId: '',
        productName: '',
    });

    // Debounced search (300ms)
    const debouncedSearch = useDebounce(searchQuery, 300);

    // Load data when search changes
    useEffect(() => {
        loadData();
    }, [debouncedSearch]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [productsData, categoriesData] = await Promise.all([
                productApi.getAll({ search: debouncedSearch || undefined }),
                categoryApi.getAll().catch(() => []),
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    // Filter products by category and visibility (search is handled by API)
    const filteredProducts = useMemo(() => {
        let result = products;
        if (categoryFilter === 'none') result = result.filter(p => !p.categoryId);
        else if (categoryFilter !== 'all') result = result.filter(p => p.categoryId === categoryFilter);

        if (visibilityFilter === 'visible') result = result.filter(p => p.isActive !== false);
        else if (visibilityFilter === 'hidden') result = result.filter(p => p.isActive === false);

        return result;
    }, [products, categoryFilter, visibilityFilter]);

    // Stats
    const totalProducts = products.length;
    const featuredProducts = products.filter((p) => p.isFeatured).length;
    const orphanedProducts = products.filter((p) => !p.categoryId).length;
    const inactiveProducts = products.filter((p) => p.isActive === false).length;
    const categoriesCount = categories.length;

    // Toggle visibility handler
    const handleToggleVisibility = async (productId: string, currentStatus: boolean) => {
        const newStatus = !currentStatus;

        // Optimistic update
        setProducts(prev => prev.map(p =>
            p.id === productId ? { ...p, isActive: newStatus } : p
        ));
        setTogglingVisibility(productId);

        try {
            await productApi.toggleVisibility(productId, newStatus);
            toast.success(newStatus ? 'Producto visible en tienda' : 'Producto oculto de la tienda');
        } catch (error) {
            // Revert on error
            setProducts(prev => prev.map(p =>
                p.id === productId ? { ...p, isActive: currentStatus } : p
            ));
            toast.error('Error al cambiar visibilidad');
        } finally {
            setTogglingVisibility(null);
        }
    };

    // Selection handlers
    const isAllSelected = filteredProducts.length > 0 &&
        filteredProducts.every(p => selectedProducts.includes(p.id));

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(filteredProducts.map(p => p.id));
        }
    };

    const toggleProduct = (productId: string) => {
        setSelectedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    // Bulk assign category
    const handleBulkAssign = async (categoryId: string | null) => {
        try {
            setBulkAssigning(true);
            await productApi.bulkUpdateCategory(selectedProducts, categoryId);
            toast.success('Categoría asignada', {
                description: `${selectedProducts.length} productos actualizados`,
            });
            setSelectedProducts([]);
            setBulkAssignOpen(false);
            loadData();
        } catch (error) {
            console.error('Error bulk assigning:', error);
            toast.error('Error al asignar categoría');
        } finally {
            setBulkAssigning(false);
        }
    };

    // Create new category and assign
    const handleCreateAndAssign = async () => {
        if (!newCategoryName.trim()) return;

        try {
            setCreatingCategory(true);
            const newCategory = await categoryApi.create({ name: newCategoryName.trim() });
            await productApi.bulkUpdateCategory(selectedProducts, newCategory.id);
            toast.success('Categoría creada y asignada', {
                description: `${selectedProducts.length} productos actualizados`,
            });
            setNewCategoryName('');
            setSelectedProducts([]);
            setBulkAssignOpen(false);
            loadData();
        } catch (error: any) {
            toast.error('Error', {
                description: error.response?.data?.error || error.message,
            });
        } finally {
            setCreatingCategory(false);
        }
    };

    // Delete handlers
    const openDeleteModal = (id: string, name: string) => {
        setDeleteModal({ isOpen: true, productId: id, productName: name });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, productId: '', productName: '' });
    };

    const handleDelete = async () => {
        try {
            await productApi.delete(deleteModal.productId);
            toast.success('¡Producto eliminado!', {
                description: `${deleteModal.productName} ha sido eliminado del catálogo`,
            });
            closeDeleteModal();
            loadData();
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Error al eliminar producto');
        }
    };

    return (
        <AdminShell>
            <Toaster position="top-right" richColors />
            <div className="min-h-screen bg-gray-50 p-8">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Panel de Administración
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Club Vitalife - Gestión de Productos
                            </p>
                            {user && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Conectado como: {user.email}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setCategoryModalOpen(true)}
                            >
                                <FolderOpen className="w-5 h-5" />
                                Gestionar Categorías
                            </Button>
                            <Button variant="outline" onClick={signOut}>
                                <LogOut className="w-5 h-5" />
                                Cerrar Sesión
                            </Button>
                            <Link href="/admin/products/new">
                                <Button size="lg">
                                    <Plus className="w-5 h-5" />
                                    Nuevo Producto
                                </Button>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {/* Total Products */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Total Productos</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {totalProducts}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                <Package className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    {/* Featured Products */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Destacados</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {featuredProducts}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                                <Star className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Categorías</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {categoriesCount}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                <Layers className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    {/* Orphaned Products */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Sin Categoría</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {orphanedProducts}
                                </p>
                            </div>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${orphanedProducts > 0 ? 'bg-amber-100' : 'bg-green-100'}`}>
                                <AlertTriangle className={`w-6 h-6 ${orphanedProducts > 0 ? 'text-amber-600' : 'text-green-600'}`} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Table Header with Search and Filter */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Productos ({filteredProducts.length})
                            </h2>

                            <div className="flex items-center gap-3 flex-wrap">
                                {/* Search Input */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Buscar productos..."
                                        className="pl-9 pr-4 py-2 w-48 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>

                                {/* Category Filter */}
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-gray-500" />
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="all">Todas las categorías</option>
                                        <option value="none">⚠️ Sin categoría</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name} ({cat.productCount})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Visibility Filter */}
                                <select
                                    value={visibilityFilter}
                                    onChange={(e) => setVisibilityFilter(e.target.value)}
                                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="all">Todos</option>
                                    <option value="visible">👁️ Visibles</option>
                                    <option value="hidden">🚫 Ocultos</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No hay productos</p>
                        </div>
                    ) : (
                        <>
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 text-sm font-medium text-gray-600 border-b">
                                <div className="col-span-1 flex items-center">
                                    <button
                                        onClick={toggleSelectAll}
                                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                                    >
                                        {isAllSelected ? (
                                            <CheckSquare className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <Square className="w-5 h-5 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                                <div className="col-span-4">Producto</div>
                                <div className="col-span-2">Categoría</div>
                                <div className="col-span-2">Estado</div>
                                <div className="col-span-3 text-right">Acciones</div>
                            </div>

                            {/* Product Rows */}
                            {filteredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className={`grid grid-cols-12 gap-4 p-4 border-b border-gray-50 hover:bg-gray-50 items-center transition-colors ${selectedProducts.includes(product.id) ? 'bg-green-50' : ''
                                        }`}
                                >
                                    {/* Checkbox */}
                                    <div className="col-span-1">
                                        <button
                                            onClick={() => toggleProduct(product.id)}
                                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                                        >
                                            {selectedProducts.includes(product.id) ? (
                                                <CheckSquare className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <Square className="w-5 h-5 text-gray-400" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Product Info */}
                                    <div className="col-span-4 flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                            {product.images?.[0]?.url ? (
                                                <Image
                                                    src={product.images[0].url}
                                                    alt={product.name}
                                                    width={64}
                                                    height={64}
                                                    className="w-full h-full object-cover"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-6 h-6 text-gray-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {product.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 line-clamp-1">
                                                {product.shortDescription}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Category */}
                                    <div className="col-span-2">
                                        {product.category ? (
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                {product.category.name}
                                            </span>
                                        ) : (
                                            <div className="flex items-center gap-1.5" title="Sin categoría asignada. Edítalo para corregir.">
                                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                                <span className="text-amber-600 text-sm font-medium">Sin categoría</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Visibility Toggle */}
                                    <div className="col-span-2">
                                        <button
                                            onClick={() => handleToggleVisibility(product.id, product.isActive !== false)}
                                            disabled={togglingVisibility === product.id}
                                            className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${product.isActive !== false
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                }`}
                                        >
                                            {togglingVisibility === product.id ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : product.isActive !== false ? (
                                                <Eye className="w-3 h-3" />
                                            ) : (
                                                <EyeOff className="w-3 h-3" />
                                            )}
                                            {product.isActive !== false ? 'Visible' : 'Oculto'}
                                        </button>
                                        {product.isFeatured && (
                                            <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                                <Star className="w-3 h-3" /> Destacado
                                            </span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-3 flex items-center justify-end gap-2">
                                        <Link
                                            href={`/admin/products/${product.id}/edit`}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Editar
                                        </Link>
                                        <button
                                            onClick={() => openDeleteModal(product.id, product.name)}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>

                {/* Floating Bulk Action Bar */}
                <AnimatePresence>
                    {selectedProducts.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40"
                        >
                            <div className="bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
                                <span className="font-medium">
                                    {selectedProducts.length} seleccionados
                                </span>

                                <div className="w-px h-6 bg-gray-700" />

                                {/* Bulk Assign Dropdown */}
                                <div className="relative">
                                    <Button
                                        onClick={() => setBulkAssignOpen(!bulkAssignOpen)}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <Layers className="w-4 h-4" />
                                        Asignar Categoría
                                    </Button>

                                    <AnimatePresence>
                                        {bulkAssignOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute bottom-full mb-2 left-0 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                                            >
                                                <div className="p-3 border-b bg-gray-50">
                                                    <p className="text-sm font-medium text-gray-700">
                                                        Seleccionar categoría
                                                    </p>
                                                </div>

                                                <div className="max-h-48 overflow-y-auto">
                                                    {categories.map(cat => (
                                                        <button
                                                            key={cat.id}
                                                            onClick={() => handleBulkAssign(cat.id)}
                                                            disabled={bulkAssigning}
                                                            className="w-full px-4 py-3 text-left text-gray-900 hover:bg-green-50 transition-colors flex items-center justify-between disabled:opacity-50"
                                                        >
                                                            <span>{cat.name}</span>
                                                            <span className="text-xs text-gray-500">
                                                                {cat.productCount} productos
                                                            </span>
                                                        </button>
                                                    ))}

                                                    <button
                                                        onClick={() => handleBulkAssign(null)}
                                                        disabled={bulkAssigning}
                                                        className="w-full px-4 py-3 text-left text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-50"
                                                    >
                                                        Quitar categoría
                                                    </button>
                                                </div>

                                                {/* Create new category */}
                                                <div className="p-3 border-t bg-gray-50">
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={newCategoryName}
                                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                                            placeholder="Nueva categoría..."
                                                            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleCreateAndAssign();
                                                            }}
                                                        />
                                                        <button
                                                            onClick={handleCreateAndAssign}
                                                            disabled={!newCategoryName.trim() || creatingCategory}
                                                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {creatingCategory ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Plus className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <button
                                    onClick={() => setSelectedProducts([])}
                                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Delete Confirmation Modal */}
                <ConfirmDeleteModal
                    isOpen={deleteModal.isOpen}
                    onClose={closeDeleteModal}
                    onConfirm={handleDelete}
                    productName={deleteModal.productName}
                />

                {/* Category Manager Modal */}
                <CategoryManagerModal
                    isOpen={categoryModalOpen}
                    onClose={() => setCategoryModalOpen(false)}
                    onCategoryChange={loadData}
                />
            </div>
        </AdminShell>
    );
}
