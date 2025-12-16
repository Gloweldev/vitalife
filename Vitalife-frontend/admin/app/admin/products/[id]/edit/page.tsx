'use client';

import { useEffect, useState, use } from 'react';
import { Toaster } from 'sonner';
import ProductWizard from '@/components/admin/ProductWizard';
import { productApi } from '@/services/api';
import { Product } from '@/types/product';
import { toast } from 'sonner';

interface EditProductPageProps {
    params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
    const resolvedParams = use(params);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProduct();
    }, [resolvedParams.id]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            console.log('Loading product with ID:', resolvedParams.id);
            const data = await productApi.getById(resolvedParams.id);
            console.log('Product loaded:', data);
            setProduct(data);
        } catch (error) {
            console.error('Error loading product:', error);
            toast.error('Error al cargar el producto');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <Toaster position="top-right" richColors />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando producto...</p>
                    </div>
                </div>
            </>
        );
    }

    if (!product) {
        return (
            <>
                <Toaster position="top-right" richColors />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-xl text-gray-900 mb-2">Producto no encontrado</p>
                        <p className="text-gray-600">El producto que buscas no existe</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Toaster position="top-right" richColors />
            <ProductWizard mode="edit" initialData={product} />
        </>
    );
}
