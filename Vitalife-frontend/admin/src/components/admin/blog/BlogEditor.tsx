'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Save,
    Eye,
    Type,
    Heading2,
    ImageIcon,
    Package,
    ArrowLeft,
    Plus,
    X,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import {
    TextBlockEditor,
    HeadingBlockEditor,
    ImageBlockEditor,
    ProductBlockEditor
} from './BlockRenderers';
import { ProductSelectorModal } from './ProductSelectorModal';
import { postApi, uploadApi, ContentBlock, PostData } from '@/services/api';

// Generate unique ID
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Convert title to slug (handles Spanish characters)
function toSlug(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[ñ]/g, 'n')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100);
}

interface BlogEditorProps {
    postId?: string; // If provided, loads existing post for editing
}

export function BlogEditor({ postId }: BlogEditorProps) {
    const router = useRouter();

    // Post metadata
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [category, setCategory] = useState('');
    const [coverImage, setCoverImage] = useState(''); // S3 key
    const [coverImagePreview, setCoverImagePreview] = useState(''); // Preview URL
    const [isSlugManual, setIsSlugManual] = useState(false);

    // Content blocks
    const [blocks, setBlocks] = useState<ContentBlock[]>([
        { id: generateId(), type: 'text', content: '' }
    ]);

    // Modal states
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isExitModalOpen, setIsExitModalOpen] = useState(false);

    // Loading states
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);

    // Track uploaded images for cleanup if user exits without saving
    const uploadedImagesRef = useRef<string[]>([]);
    const savedSuccessfullyRef = useRef(false);

    // Load existing post if postId is provided
    useEffect(() => {
        if (postId) {
            loadPost(postId);
        }
    }, [postId]);

    const loadPost = async (id: string) => {
        try {
            setLoading(true);
            const post = await postApi.getById(id);
            setTitle(post.title);
            setSlug(post.slug);
            setCategory(post.category || '');
            setCoverImage(post.coverImage || '');
            setCoverImagePreview(post.coverImage || ''); // API returns signed URL
            setBlocks(post.content || [{ id: generateId(), type: 'text', content: '' }]);
            setIsSlugManual(true);
        } catch (error) {
            console.error('Error loading post:', error);
            toast.error('Error al cargar el post');
            router.push('/admin/blog');
        } finally {
            setLoading(false);
        }
    };

    // Auto-generate slug when title changes (if not manually edited)
    useEffect(() => {
        if (!isSlugManual && title) {
            setSlug(toSlug(title));
        }
    }, [title, isSlugManual]);

    // Handle manual slug change
    const handleSlugChange = (value: string) => {
        setIsSlugManual(true);
        setSlug(toSlug(value));
    };

    // Cleanup orphaned images when component unmounts without saving
    useEffect(() => {
        return () => {
            // Only cleanup if we haven't saved successfully
            if (!savedSuccessfullyRef.current && uploadedImagesRef.current.length > 0) {
                console.log('🧹 Cleaning up orphaned images:', uploadedImagesRef.current);
                // Delete each uploaded image
                uploadedImagesRef.current.forEach(key => {
                    uploadApi.deleteFile(key).catch(err => {
                        console.warn('Failed to delete orphaned image:', key, err);
                    });
                });
            }
        };
    }, []);

    // Handle beforeunload (tab/browser close) - warn user and cleanup
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (uploadedImagesRef.current.length > 0 && !savedSuccessfullyRef.current) {
                // Show browser's default warning
                e.preventDefault();
                e.returnValue = '';

                // Try to cleanup images using sendBeacon (best effort)
                const keys = uploadedImagesRef.current;
                if (keys.length > 0) {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                    navigator.sendBeacon(
                        `${apiUrl}/uploads/cleanup`,
                        JSON.stringify({ keys })
                    );
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    // Handle back navigation with modal confirmation
    const handleBack = () => {
        if (uploadedImagesRef.current.length > 0 && !savedSuccessfullyRef.current) {
            setIsExitModalOpen(true);
        } else {
            router.push('/admin/blog');
        }
    };

    // Confirm exit and cleanup images
    const confirmExit = () => {
        setIsExitModalOpen(false);
        router.push('/admin/blog');
    };

    // Add new block
    const addBlock = useCallback((type: 'text' | 'heading' | 'image') => {
        const newBlock: ContentBlock = type === 'text'
            ? { id: generateId(), type: 'text', content: '' }
            : type === 'heading'
                ? { id: generateId(), type: 'heading', content: '', level: 2 }
                : { id: generateId(), type: 'image', url: '' };

        setBlocks(prev => [...prev, newBlock]);
    }, []);

    // Add product block
    const addProductBlock = useCallback((product: { id: string; name: string; image: string }) => {
        const newBlock: ContentBlock = {
            id: generateId(),
            type: 'product',
            productId: product.id,
            productName: product.name,
            productImage: product.image,
        };
        setBlocks(prev => [...prev, newBlock]);
    }, []);

    // Update block content
    const updateBlock = useCallback((blockId: string, updates: Partial<ContentBlock>) => {
        setBlocks(prev => prev.map(block =>
            block.id === blockId ? { ...block, ...updates } : block
        ));
    }, []);

    // Delete block
    const deleteBlock = useCallback((blockId: string) => {
        setBlocks(prev => {
            const filtered = prev.filter(block => block.id !== blockId);
            if (filtered.length === 0) {
                return [{ id: generateId(), type: 'text', content: '' }];
            }
            return filtered;
        });
    }, []);

    // Handle cover image upload - REAL API
    const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploadingCover(true);

            // If replacing existing cover, remove old key from tracking
            if (coverImage && !postId) {
                uploadedImagesRef.current = uploadedImagesRef.current.filter(k => k !== coverImage);
                // Delete old cover from S3
                uploadApi.deleteFile(coverImage).catch(console.warn);
            }

            const result = await uploadApi.uploadPostCover(file);

            setCoverImage(result.key);
            setCoverImagePreview(result.previewUrl);

            // Track for cleanup if not saved (only for new posts)
            if (!postId) {
                uploadedImagesRef.current.push(result.key);
            }

            toast.success('Imagen de portada subida');
        } catch (error) {
            console.error('Error uploading cover:', error);
            toast.error('Error al subir la imagen');
        } finally {
            setUploadingCover(false);
        }
    };

    // Handle content image upload - for ImageBlockEditor
    const handleImageBlockUpload = async (blockId: string, file: File) => {
        try {
            const result = await uploadApi.uploadBlogImage(file);

            updateBlock(blockId, {
                url: result.key,
                preview: result.previewUrl,
            });

            // Track for cleanup if not saved (only for new posts)
            if (!postId) {
                uploadedImagesRef.current.push(result.key);
            }

            toast.success('Imagen subida');
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Error al subir la imagen');
        }
    };

    // Publish / Save
    const handleSave = async (status: 'draft' | 'published') => {
        if (!title.trim()) {
            toast.error('El título es requerido');
            return;
        }

        try {
            setSaving(true);

            const postData: PostData = {
                title,
                slug,
                category: category || undefined,
                coverImage: coverImage || undefined,
                content: blocks.filter(block => {
                    if (block.type === 'text' || block.type === 'heading') {
                        return block.content?.trim() !== '';
                    }
                    if (block.type === 'image') {
                        return block.url !== '';
                    }
                    if (block.type === 'product') {
                        return block.productId !== '';
                    }
                    return true;
                }),
                postType: 'article',
                status,
            };

            if (postId) {
                await postApi.update(postId, postData);
                toast.success('Post actualizado');
            } else {
                await postApi.create(postData);
                toast.success('Post creado');
            }

            // Mark as saved successfully - don't cleanup images
            savedSuccessfullyRef.current = true;
            uploadedImagesRef.current = []; // Clear tracking

            router.push('/admin/blog');
        } catch (error) {
            console.error('Error saving post:', error);
            toast.error('Error al guardar el post');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleBack}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900">
                                {postId ? 'Editar Artículo' : 'Nuevo Artículo'}
                            </h1>
                            <p className="text-sm text-gray-500">
                                {slug ? `/blog/${slug}` : 'URL se generará automáticamente'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsPreviewOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Eye className="w-4 h-4" />
                            Vista Previa
                        </button>
                        <button
                            onClick={() => handleSave('draft')}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Guardar Borrador
                        </button>
                        <button
                            onClick={() => handleSave('published')}
                            disabled={saving}
                            className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-600/25 disabled:opacity-50"
                        >
                            {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Publicar
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-3xl mx-auto px-4 py-8">
                {/* Metadata Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
                    {/* Cover Image */}
                    <div className="mb-6">
                        {!coverImagePreview ? (
                            <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-500 hover:bg-green-50/50 transition-colors ${uploadingCover ? 'pointer-events-none opacity-50' : ''}`}>
                                {uploadingCover ? (
                                    <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
                                ) : (
                                    <>
                                        <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-500">Imagen de Portada</p>
                                        <p className="text-xs text-gray-400 mt-1">Recomendado: 1200x630px</p>
                                    </>
                                )}
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleCoverImageChange}
                                    disabled={uploadingCover}
                                />
                            </label>
                        ) : (
                            <div className="relative aspect-[2/1] rounded-xl overflow-hidden bg-gray-100">
                                <img
                                    src={coverImagePreview}
                                    alt="Cover"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    onClick={() => {
                                        setCoverImage('');
                                        setCoverImagePreview('');
                                    }}
                                    className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Título del artículo..."
                        className="w-full text-3xl font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none mb-4"
                    />

                    {/* Slug & Category */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                URL (Slug)
                            </label>
                            <div className="flex items-center">
                                <span className="text-sm text-gray-400 mr-1">/blog/</span>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => handleSlugChange(e.target.value)}
                                    placeholder="url-del-articulo"
                                    className="flex-1 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Categoría
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="">Seleccionar...</option>
                                <option value="Recetas">Recetas</option>
                                <option value="Nutrición">Nutrición</option>
                                <option value="Fitness">Fitness</option>
                                <option value="Bienestar">Bienestar</option>
                                <option value="Tips">Tips</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Content Blocks */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
                    <div className="space-y-4 pl-10">
                        {blocks.map((block) => {
                            switch (block.type) {
                                case 'text':
                                    return (
                                        <TextBlockEditor
                                            key={block.id}
                                            block={block}
                                            onChange={(content) => updateBlock(block.id!, { content })}
                                            onDelete={() => deleteBlock(block.id!)}
                                        />
                                    );
                                case 'heading':
                                    return (
                                        <HeadingBlockEditor
                                            key={block.id}
                                            block={block}
                                            onChange={(content) => updateBlock(block.id!, { content })}
                                            onDelete={() => deleteBlock(block.id!)}
                                        />
                                    );
                                case 'image':
                                    return (
                                        <ImageBlockEditor
                                            key={block.id}
                                            block={block}
                                            onChange={(updates) => updateBlock(block.id!, updates)}
                                            onDelete={() => deleteBlock(block.id!)}
                                            onUpload={(file) => handleImageBlockUpload(block.id!, file)}
                                        />
                                    );
                                case 'product':
                                    return (
                                        <ProductBlockEditor
                                            key={block.id}
                                            block={block}
                                            onDelete={() => deleteBlock(block.id!)}
                                        />
                                    );
                                default:
                                    return null;
                            }
                        })}
                    </div>
                </div>

                {/* Add Block Toolbar */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                    <p className="text-sm text-gray-500 mb-3 text-center">Agregar bloque</p>
                    <div className="flex items-center justify-center gap-3">
                        <button
                            onClick={() => addBlock('text')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        >
                            <Type className="w-4 h-4" />
                            Texto
                        </button>
                        <button
                            onClick={() => addBlock('heading')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        >
                            <Heading2 className="w-4 h-4" />
                            Título
                        </button>
                        <button
                            onClick={() => addBlock('image')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        >
                            <ImageIcon className="w-4 h-4" />
                            Imagen
                        </button>
                        <button
                            onClick={() => setIsProductModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                        >
                            <Package className="w-4 h-4" />
                            Producto
                        </button>
                    </div>
                </div>
            </main>

            {/* Floating Add Button (Mobile) */}
            <button
                className="fixed bottom-6 right-6 md:hidden w-14 h-14 bg-green-600 text-white rounded-full shadow-lg shadow-green-600/30 flex items-center justify-center hover:bg-green-700 transition-colors"
            >
                <Plus className="w-6 h-6" />
            </button>

            {/* Product Selector Modal */}
            <ProductSelectorModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onSelect={addProductBlock}
            />

            {/* Exit Confirmation Modal */}
            {isExitModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsExitModalOpen(false)}
                    />

                    {/* Modal */}
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
                        {/* Warning Icon */}
                        <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                            ¿Salir sin guardar?
                        </h3>

                        <p className="text-gray-600 text-center mb-6">
                            Tienes <span className="font-semibold text-yellow-600">{uploadedImagesRef.current.length} imagen(es)</span> subidas
                            que no se han guardado. Si sales ahora, serán eliminadas.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsExitModalOpen(false)}
                                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Volver al editor
                            </button>
                            <button
                                onClick={confirmExit}
                                className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
                            >
                                Salir y eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {isPreviewOpen && (
                <PreviewModal
                    title={title}
                    coverImage={coverImagePreview}
                    category={category}
                    blocks={blocks}
                    onClose={() => setIsPreviewOpen(false)}
                    onPublish={() => handleSave('published')}
                />
            )}
        </div>
    );
}

// Preview Modal Component
interface PreviewModalProps {
    title: string;
    coverImage: string;
    category: string;
    blocks: ContentBlock[];
    onClose: () => void;
    onPublish: () => void;
}

function PreviewModal({ title, coverImage, category, blocks, onClose, onPublish }: PreviewModalProps) {
    return (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Floating Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-medium text-gray-600">
                            Vista Previa
                        </span>
                    </div>
                    <button
                        onClick={() => {
                            onPublish();
                            onClose();
                        }}
                        className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-600/25"
                    >
                        <Save className="w-4 h-4" />
                        Publicar Ahora
                    </button>
                </div>
            </header>

            {/* Preview Content */}
            <main className="pt-20 pb-16">
                <article className="max-w-3xl mx-auto px-4">
                    {category && (
                        <div className="text-center mb-6">
                            <span className="inline-block bg-green-100 text-green-700 text-sm font-semibold px-4 py-1.5 rounded-full">
                                {category}
                            </span>
                        </div>
                    )}

                    <h1 className="font-serif text-3xl md:text-5xl font-bold text-gray-900 text-center mb-8 leading-tight">
                        {title || 'Sin título'}
                    </h1>

                    {coverImage && (
                        <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden mb-12 shadow-xl">
                            <img
                                src={coverImage}
                                alt={title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="prose prose-lg prose-gray max-w-none">
                        {blocks.map((block) => (
                            <PreviewBlock key={block.id} block={block} />
                        ))}
                    </div>

                    {blocks.length === 0 || (blocks.length === 1 && blocks[0].type === 'text' && !blocks[0].content) ? (
                        <div className="text-center py-16 text-gray-400">
                            <p>No hay contenido para previsualizar</p>
                        </div>
                    ) : null}
                </article>
            </main>
        </div>
    );
}

// Preview Block Renderer
function PreviewBlock({ block }: { block: ContentBlock }) {
    switch (block.type) {
        case 'text':
            if (!block.content) return null;
            return (
                <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                    {block.content}
                </p>
            );

        case 'heading':
            if (!block.content) return null;
            if (block.level === 3) {
                return <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">{block.content}</h3>;
            }
            return <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">{block.content}</h2>;

        case 'image':
            const imageUrl = block.preview || block.url;
            if (!imageUrl) return null;
            return (
                <figure className="my-8">
                    <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
                        <img
                            src={imageUrl}
                            alt={block.caption || 'Imagen del artículo'}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {block.caption && (
                        <figcaption className="text-center text-sm text-gray-500 mt-3 italic">
                            {block.caption}
                        </figcaption>
                    )}
                </figure>
            );

        case 'product':
            return (
                <div className="my-8 bg-gradient-to-r from-gray-50 to-green-50 border border-gray-200 rounded-2xl p-6">
                    <div className="flex items-center gap-6">
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-white shadow-md flex-shrink-0">
                            {block.productImage && (
                                <img
                                    src={block.productImage}
                                    alt={block.productName || ''}
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                        <div className="flex-1">
                            <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                                Producto Recomendado
                            </span>
                            <h4 className="text-xl font-bold text-gray-900 mt-1 mb-3">
                                {block.productName}
                            </h4>
                            <div className="flex gap-3">
                                <button className="px-4 py-2 text-sm font-semibold rounded-full bg-white text-green-600 border-2 border-green-600 hover:bg-green-50 transition-all">
                                    Ver Producto
                                </button>
                                <button className="px-4 py-2 text-sm font-semibold rounded-full bg-[#25D366] text-white hover:bg-[#20BA5A] transition-all">
                                    Cotizar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );

        default:
            return null;
    }
}
