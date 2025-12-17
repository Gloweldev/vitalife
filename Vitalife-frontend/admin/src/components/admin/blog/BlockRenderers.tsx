'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Trash2, GripVertical, Type, ImageIcon, Package } from 'lucide-react';

// Block Types
export interface TextBlock {
    id?: string;
    type: 'text';
    content: string;
}

export interface HeadingBlock {
    id?: string;
    type: 'heading';
    content: string;
    level: 2 | 3;
}

export interface ImageBlock {
    id?: string;
    type: 'image';
    url: string;
    caption?: string;
    preview?: string;
}

export interface ProductBlock {
    id?: string;
    type: 'product';
    productId: string;
    productName: string;
    productImage: string;
}

export type ContentBlock = TextBlock | HeadingBlock | ImageBlock | ProductBlock;

interface BlockWrapperProps {
    children: React.ReactNode;
    onDelete: () => void;
    isDragging?: boolean;
}

function BlockWrapper({ children, onDelete }: BlockWrapperProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="group relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Drag Handle & Actions */}
            <div className={`absolute -left-10 top-1/2 -translate-y-1/2 flex items-center gap-1 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                <button className="p-1 text-gray-400 hover:text-gray-600 cursor-grab">
                    <GripVertical className="w-4 h-4" />
                </button>
            </div>

            {/* Delete Button */}
            <button
                onClick={onDelete}
                className={`absolute -right-10 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            >
                <Trash2 className="w-4 h-4" />
            </button>

            {children}
        </div>
    );
}

// Text Block Editor
interface TextBlockEditorProps {
    block: TextBlock;
    onChange: (content: string) => void;
    onDelete: () => void;
}

export function TextBlockEditor({ block, onChange, onDelete }: TextBlockEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [block.content]);

    return (
        <BlockWrapper onDelete={onDelete}>
            <textarea
                ref={textareaRef}
                value={block.content}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Escribe tu texto aquí..."
                className="w-full resize-none overflow-hidden bg-transparent text-gray-700 text-lg leading-relaxed placeholder:text-gray-400 focus:outline-none min-h-[60px] py-2"
                rows={1}
            />
        </BlockWrapper>
    );
}

// Heading Block Editor
interface HeadingBlockEditorProps {
    block: HeadingBlock;
    onChange: (content: string) => void;
    onDelete: () => void;
}

export function HeadingBlockEditor({ block, onChange, onDelete }: HeadingBlockEditorProps) {
    return (
        <BlockWrapper onDelete={onDelete}>
            <input
                type="text"
                value={block.content}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Subtítulo..."
                className={`w-full bg-transparent text-gray-900 font-bold placeholder:text-gray-400 focus:outline-none py-2 ${block.level === 2 ? 'text-2xl' : 'text-xl'
                    }`}
            />
        </BlockWrapper>
    );
}

// Image Block Editor
interface ImageBlockEditorProps {
    block: ImageBlock & { preview?: string };
    onChange: (updates: Partial<ImageBlock & { preview?: string }>) => void;
    onDelete: () => void;
    onUpload?: (file: File) => Promise<void>;
}

export function ImageBlockEditor({ block, onChange, onDelete, onUpload }: ImageBlockEditorProps) {
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        try {
            if (onUpload) {
                // Use real API upload
                await onUpload(file);
            } else {
                // Fallback to local preview
                const reader = new FileReader();
                reader.onloadend = () => {
                    onChange({ url: reader.result as string });
                };
                reader.readAsDataURL(file);
            }
        } finally {
            setIsUploading(false);
        }
    };

    // Display preview URL if available, otherwise use url (which might be an S3 key)
    const displayUrl = block.preview || block.url;

    return (
        <BlockWrapper onDelete={onDelete}>
            <div className="py-2">
                {!displayUrl ? (
                    <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-500 hover:bg-green-50/50 transition-colors ${isUploading ? 'pointer-events-none opacity-50' : ''}`}>
                        <div className="flex flex-col items-center">
                            {isUploading ? (
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
                            ) : (
                                <>
                                    <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500">Click para subir imagen</p>
                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG hasta 5MB</p>
                                </>
                            )}
                        </div>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={isUploading}
                        />
                    </label>
                ) : (
                    <div className="space-y-2">
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
                            <img
                                src={displayUrl}
                                alt={block.caption || 'Imagen del post'}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <input
                            type="text"
                            value={block.caption || ''}
                            onChange={(e) => onChange({ caption: e.target.value })}
                            placeholder="Agregar descripción de la imagen..."
                            className="w-full text-sm text-gray-500 text-center bg-transparent focus:outline-none placeholder:text-gray-400"
                        />
                    </div>
                )}
            </div>
        </BlockWrapper>
    );
}

// Product Block Editor (Display Only)
interface ProductBlockEditorProps {
    block: ProductBlock;
    onDelete: () => void;
}

export function ProductBlockEditor({ block, onDelete }: ProductBlockEditorProps) {
    return (
        <BlockWrapper onDelete={onDelete}>
            <div className="py-2">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-green-50 border border-gray-200 rounded-xl">
                    {/* Product Image */}
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white shadow-sm flex-shrink-0">
                        <Image
                            src={block.productImage}
                            alt={block.productName}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <Package className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                                Widget de Producto
                            </span>
                        </div>
                        <p className="font-semibold text-gray-900 truncate">
                            {block.productName}
                        </p>
                        <p className="text-xs text-gray-500">
                            ID: {block.productId.slice(0, 8)}...
                        </p>
                    </div>
                </div>
            </div>
        </BlockWrapper>
    );
}
