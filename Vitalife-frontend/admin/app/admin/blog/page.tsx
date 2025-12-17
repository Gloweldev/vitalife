'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Pencil,
    Trash2,
    Eye,
    Calendar,
    Loader2,
    Newspaper,
    Search,
    Filter,
    Tags,
    CheckSquare,
    X,
    ChevronDown,
    Archive
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminShell } from '@/components/admin/AdminShell';
import { BlogCategoryManager } from '@/components/admin/blog/BlogCategoryManager';
import { postApi, blogCategoryApi, Post, BlogCategory } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function BlogManagementPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    // Data states
    const [posts, setPosts] = useState<Post[]>([]);
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');

    // Selection states
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [selectAll, setSelectAll] = useState(false);

    // Modal states
    const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
    const [isBulkCategoryModalOpen, setIsBulkCategoryModalOpen] = useState(false);

    // Action states
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [bulkActionLoading, setBulkActionLoading] = useState(false);

    // Calculate stats
    const stats = useMemo(() => ({
        total: posts.length,
        published: posts.filter(p => p.status === 'published').length,
        drafts: posts.filter(p => p.status === 'draft').length,
    }), [posts]);

    // Filter posts
    const filteredPosts = useMemo(() => {
        return posts.filter(post => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                if (!post.title.toLowerCase().includes(query) &&
                    !post.slug.toLowerCase().includes(query)) {
                    return false;
                }
            }

            // Status filter
            if (statusFilter !== 'all' && post.status !== statusFilter) {
                return false;
            }

            // Category filter
            if (categoryFilter !== 'all') {
                if (categoryFilter === 'none' && post.categoryId) return false;
                if (categoryFilter !== 'none' && post.categoryId !== categoryFilter) return false;
            }

            return true;
        });
    }, [posts, searchQuery, statusFilter, categoryFilter]);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/admin/login');
        }
    }, [user, authLoading, router]);

    // Load data when authenticated
    useEffect(() => {
        if (user && !authLoading) {
            loadData();
        }
    }, [user, authLoading]);

    // Handle select all toggle
    useEffect(() => {
        if (selectAll) {
            setSelectedIds(new Set(filteredPosts.map(p => p.id)));
        } else {
            setSelectedIds(new Set());
        }
    }, [selectAll, filteredPosts]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [postsData, categoriesData] = await Promise.all([
                postApi.getAll(),
                blogCategoryApi.getAll(),
            ]);
            setPosts(postsData.posts || []);
            setCategories(categoriesData || []);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return;

        try {
            setDeletingId(id);
            await postApi.delete(id);
            toast.success('Publicación eliminada');
            loadData();
        } catch (error) {
            console.error('Error deleting post:', error);
            toast.error('Error al eliminar');
        } finally {
            setDeletingId(null);
        }
    };

    const handleBulkAction = async (action: 'publish' | 'unpublish' | 'archive' | 'delete', categoryId?: string) => {
        const ids = Array.from(selectedIds);
        if (ids.length === 0) return;

        if (action === 'delete') {
            if (!confirm(`¿Eliminar ${ids.length} publicaciones? Esta acción no se puede deshacer.`)) return;
        }

        try {
            setBulkActionLoading(true);
            await postApi.bulkUpdate(ids, action, categoryId);
            toast.success(`${ids.length} publicaciones actualizadas`);
            setSelectedIds(new Set());
            setSelectAll(false);
            loadData();
        } catch (error) {
            console.error('Error in bulk action:', error);
            toast.error('Error al actualizar publicaciones');
        } finally {
            setBulkActionLoading(false);
        }
    };

    const handleBulkCategoryChange = async (categoryId: string | null) => {
        const ids = Array.from(selectedIds);
        if (ids.length === 0) return;

        try {
            setBulkActionLoading(true);
            await postApi.bulkUpdate(ids, 'changeCategory', categoryId || '');
            toast.success(`${ids.length} publicaciones actualizadas`);
            setIsBulkCategoryModalOpen(false);
            setSelectedIds(new Set());
            setSelectAll(false);
            loadData();
        } catch (error) {
            console.error('Error changing category:', error);
            toast.error('Error al cambiar categoría');
        } finally {
            setBulkActionLoading(false);
        }
    };

    const toggleSelection = (id: string) => {
        const newSelection = new Set(selectedIds);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedIds(newSelection);
        setSelectAll(newSelection.size === filteredPosts.length);
    };

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getCategoryName = (categoryId: string | null | undefined) => {
        if (!categoryId) return null;
        const cat = categories.find(c => c.id === categoryId);
        return cat?.name;
    };

    // Auth loading state
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <AdminShell>
            <div className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Gestión de Publicaciones
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Administra los artículos del blog
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsCategoryManagerOpen(true)}
                            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            <Tags className="w-4 h-4" />
                            Categorías
                        </button>
                        <Link
                            href="/admin/blog/new"
                            className="flex items-center gap-2 px-5 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-600/25"
                        >
                            <Plus className="w-5 h-5" />
                            Crear Publicación
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                        <p className="text-sm font-medium text-gray-500">Total</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">
                            {loading ? '...' : stats.total}
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                        <p className="text-sm font-medium text-gray-500">Publicados</p>
                        <p className="text-3xl font-bold text-green-600 mt-1">
                            {loading ? '...' : stats.published}
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                        <p className="text-sm font-medium text-gray-500">Borradores</p>
                        <p className="text-3xl font-bold text-yellow-600 mt-1">
                            {loading ? '...' : stats.drafts}
                        </p>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar por título..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            >
                                <option value="all">Todos los estados</option>
                                <option value="published">Publicados</option>
                                <option value="draft">Borradores</option>
                                <option value="archived">Archivados</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>

                        {/* Category Filter */}
                        <div className="relative">
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            >
                                <option value="all">Todas las categorías</option>
                                <option value="none">Sin categoría</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>

                        {/* Clear Filters */}
                        {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setStatusFilter('all');
                                    setCategoryFilter('all');
                                }}
                                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4" />
                                Limpiar
                            </button>
                        )}
                    </div>
                </div>

                {/* Bulk Actions Toolbar */}
                {selectedIds.size > 0 && (
                    <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-lg animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center gap-3 text-white">
                            <CheckSquare className="w-5 h-5" />
                            <span className="font-semibold">{selectedIds.size} seleccionados</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleBulkAction('publish')}
                                disabled={bulkActionLoading}
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                                Publicar
                            </button>
                            <button
                                onClick={() => handleBulkAction('unpublish')}
                                disabled={bulkActionLoading}
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                                Despublicar
                            </button>
                            <button
                                onClick={() => setIsBulkCategoryModalOpen(true)}
                                disabled={bulkActionLoading}
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                                Cambiar Categoría
                            </button>
                            <button
                                onClick={() => handleBulkAction('delete')}
                                disabled={bulkActionLoading}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                                {bulkActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Eliminar'}
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedIds(new Set());
                                    setSelectAll(false);
                                }}
                                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Posts Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                            <span className="ml-3 text-gray-500">Cargando...</span>
                        </div>
                    ) : filteredPosts.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Newspaper className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {posts.length === 0 ? 'No hay publicaciones' : 'Sin resultados'}
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {posts.length === 0 ? 'Crea tu primera publicación' : 'Ajusta los filtros'}
                            </p>
                            {posts.length === 0 && (
                                <Link
                                    href="/admin/blog/new"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Crear Publicación
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="py-4 px-4 w-12">
                                            <input
                                                type="checkbox"
                                                checked={selectAll}
                                                onChange={(e) => setSelectAll(e.target.checked)}
                                                className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                                            />
                                        </th>
                                        <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">
                                            Artículo
                                        </th>
                                        <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">
                                            Categoría
                                        </th>
                                        <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">
                                            Estado
                                        </th>
                                        <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">
                                            Fecha
                                        </th>
                                        <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">
                                            Vistas
                                        </th>
                                        <th className="text-right py-4 px-4 font-semibold text-gray-700 text-sm">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPosts.map((post) => (
                                        <tr
                                            key={post.id}
                                            className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedIds.has(post.id) ? 'bg-green-50' : ''}`}
                                        >
                                            <td className="py-4 px-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(post.id)}
                                                    onChange={() => toggleSelection(post.id)}
                                                    className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                                                />
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                        {post.coverImage ? (
                                                            <Image
                                                                src={post.coverImage}
                                                                alt={post.title}
                                                                fill
                                                                className="object-cover"
                                                                unoptimized
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Newspaper className="w-6 h-6 text-gray-300" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-gray-900 truncate max-w-xs">
                                                            {post.title}
                                                        </p>
                                                        <p className="text-sm text-gray-500 truncate">
                                                            /blog/{post.slug}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                {post.categoryId ? (
                                                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                        {getCategoryName(post.categoryId)}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-yellow-600 text-sm">
                                                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                                                        Sin categoría
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4">
                                                {post.status === 'published' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                                        Publicado
                                                    </span>
                                                ) : post.status === 'archived' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                                                        <Archive className="w-3 h-3" />
                                                        Archivado
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                                                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                                                        Borrador
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(post.publishedAt || post.createdAt)}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Eye className="w-4 h-4" />
                                                    {post.views?.toLocaleString() || 0}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/admin/blog/${post.id}/edit`}
                                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(post.id, post.title)}
                                                        disabled={deletingId === post.id}
                                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Eliminar"
                                                    >
                                                        {deletingId === post.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Category Manager Modal */}
            <BlogCategoryManager
                isOpen={isCategoryManagerOpen}
                onClose={() => setIsCategoryManagerOpen(false)}
                onCategoriesChange={loadData}
            />

            {/* Bulk Category Change Modal */}
            {isBulkCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsBulkCategoryModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Cambiar Categoría</h3>
                        <p className="text-gray-500 mb-6">
                            Selecciona la nueva categoría para {selectedIds.size} publicaciones:
                        </p>
                        <div className="space-y-2 max-h-64 overflow-y-auto mb-6">
                            <button
                                onClick={() => handleBulkCategoryChange(null)}
                                disabled={bulkActionLoading}
                                className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Sin categoría
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleBulkCategoryChange(cat.id)}
                                    disabled={bulkActionLoading}
                                    className="w-full p-3 text-left bg-gray-50 hover:bg-green-50 hover:text-green-700 rounded-xl transition-colors"
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setIsBulkCategoryModalOpen(false)}
                            className="w-full py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </AdminShell>
    );
}
