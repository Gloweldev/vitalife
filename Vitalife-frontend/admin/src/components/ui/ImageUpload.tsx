'use client';

import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
    value: string;
    onChange: (value: string, file?: File) => void;
    label?: string;
}

export function ImageUpload({ value, onChange, label = "Imagen" }: ImageUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            const imageUrl = URL.createObjectURL(file);
            onChange(imageUrl, file); // Pass both URL and File
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleRemove = () => {
        onChange(''); // Clear without file
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div>
            {label && (
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {label}
                </label>
            )}

            {value ? (
                // Image Preview
                <div className="relative group">
                    <div className="relative aspect-square w-full max-w-sm rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50">
                        <Image
                            src={value}
                            alt="Preview"
                            fill
                            className="object-contain p-4"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                // Upload Area
                <div
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
            relative cursor-pointer rounded-xl border-2 border-dashed transition-all
            ${isDragging
                            ? 'border-green-600 bg-green-50'
                            : 'border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-gray-100'
                        }
          `}
                >
                    <div className="flex flex-col items-center justify-center py-12 px-6">
                        <div className={`
              w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors
              ${isDragging ? 'bg-green-100' : 'bg-gray-200'}
            `}>
                            <Upload className={`w-8 h-8 ${isDragging ? 'text-green-600' : 'text-gray-400'}`} />
                        </div>
                        <p className="text-base font-semibold text-gray-700 mb-1">
                            {isDragging ? 'Suelta la imagen aquí' : 'Click o arrastra tu imagen'}
                        </p>
                        <p className="text-sm text-gray-500">
                            PNG, JPG, GIF hasta 10MB
                        </p>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                        className="hidden"
                    />
                </div>
            )}
        </div>
    );
}
