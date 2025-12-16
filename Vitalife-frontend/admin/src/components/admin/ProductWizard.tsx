'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Save,
    Sparkles,
    X,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { CategorySelector } from '@/components/admin/CategorySelector';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductDetailView } from '@/components/products/ProductDetailView';
import { Product, ProductFormData } from '@/types/product';
import { productApi } from '@/services/api';

const STEPS = [
    { number: 1, title: 'Portada', description: 'Información básica' },
    { number: 2, title: 'Detalles', description: 'Contenido profundo' },
];

interface ProductWizardProps {
    initialData?: Product;
    mode?: 'create' | 'edit';
}

export default function ProductWizard({ initialData, mode = 'create' }: ProductWizardProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    // Track actual image files for upload
    const [imageFiles, setImageFiles] = useState<File[]>([]);

    const { register, watch, setValue, reset } = useForm<ProductFormData>({
        defaultValues: {
            name: '',
            categoryId: null,
            mainImage: '',
            secondaryImages: [],
            shortDescription: '',
            fullDescription: '',
            flavors: [],
            benefits: [],
            featured: false,
        },
    });

    // Load initial data if editing
    useEffect(() => {
        if (initialData) {
            console.log('Loading initial data:', initialData);
            reset({
                name: initialData.name,
                categoryId: initialData.categoryId || null,
                mainImage: initialData.images?.[0]?.url || '',
                secondaryImages: initialData.images?.slice(1).map(img => img.url) || [],
                shortDescription: initialData.shortDescription,
                fullDescription: initialData.fullDescription,
                flavors: initialData.flavors?.map(f => f.name) || [],
                benefits: initialData.benefits?.map(b => b.text) || [],
                featured: initialData.isFeatured || false,
            });
        }
    }, [initialData, reset]);

    const formData = watch();

    // Input states for arrays
    const [flavorInput, setFlavorInput] = useState('');
    const [benefitInput, setBenefitInput] = useState('');

    // Convert form data to Product for preview
    const previewProduct: Product = {
        id: initialData?.id || 'preview',
        name: formData.name || 'Nombre del Producto',
        categoryId: formData.categoryId,
        images: [
            formData.mainImage ? { url: formData.mainImage, isMain: true } : null,
            ...formData.secondaryImages.map(url => url ? { url, isMain: false } : null)
        ].filter((img): img is { url: string; isMain: boolean } => img !== null && img.url !== ''),
        description: formData.shortDescription || 'Descripción corta del producto',
        shortDescription: formData.shortDescription || 'Descripción corta del producto',
        fullDescription: formData.fullDescription || 'Descripción detallada del producto...',
        benefits: formData.benefits.length > 0
            ? formData.benefits.map(b => ({ id: Math.random().toString(), text: b, productId: 'preview' }))
            : [{ id: '1', text: 'Beneficio 1', productId: 'preview' }, { id: '2', text: 'Beneficio 2', productId: 'preview' }],
        flavors: formData.flavors.length > 0
            ? formData.flavors.map(f => ({ id: Math.random().toString(), name: f, productId: 'preview' }))
            : undefined,
        isFeatured: formData.featured,
    };

    // Array handlers
    const addFlavor = () => {
        if (flavorInput.trim() && !formData.flavors.includes(flavorInput.trim())) {
            setValue('flavors', [...formData.flavors, flavorInput.trim()]);
            setFlavorInput('');
        }
    };

    const removeFlavor = (flavor: string) => {
        setValue('flavors', formData.flavors.filter((f: string) => f !== flavor));
    };

    const addBenefit = () => {
        if (benefitInput.trim() && !formData.benefits.includes(benefitInput.trim())) {
            setValue('benefits', [...formData.benefits, benefitInput.trim()]);
            setBenefitInput('');
        }
    };

    const removeBenefit = (benefit: string) => {
        setValue('benefits', formData.benefits.filter((b: string) => b !== benefit));
    };

    const handleNext = () => {
        if (currentStep < STEPS.length) {
            setDirection(1);
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setDirection(-1);
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);

            // Validate required fields
            if (!formData.name || !formData.shortDescription || !formData.fullDescription) {
                toast.error('Por favor completa todos los campos requeridos');
                return;
            }

            if (!formData.mainImage && imageFiles.length === 0) {
                toast.error('Debes agregar al menos una imagen');
                return;
            }

            if (formData.benefits.length === 0) {
                toast.error('Debes agregar al menos un beneficio');
                return;
            }

            // Create FormData for API
            const apiFormData = new FormData();
            apiFormData.append('name', formData.name);
            apiFormData.append('shortDescription', formData.shortDescription);
            apiFormData.append('fullDescription', formData.fullDescription);
            apiFormData.append('isFeatured', formData.featured.toString());

            // Category
            if (formData.categoryId) {
                apiFormData.append('categoryId', formData.categoryId);
            }

            // Benefits
            formData.benefits.forEach(benefit => {
                apiFormData.append('benefits', benefit);
            });

            // Flavors (optional)
            formData.flavors.forEach(flavor => {
                apiFormData.append('flavors', flavor);
            });

            // Images - convert blob URLs to actual files
            if (imageFiles.length > 0) {
                imageFiles.forEach(file => {
                    apiFormData.append('images', file);
                });
            }

            // Submit to API
            if (mode === 'edit' && initialData?.id) {
                await productApi.update(initialData.id, apiFormData);
                toast.success('Producto actualizado correctamente', {
                    description: `${formData.name} se ha actualizado exitosamente`,
                });
            } else {
                await productApi.create(apiFormData);
                toast.success('¡Producto creado exitosamente!', {
                    description: `${formData.name} se ha agregado al catálogo`,
                });
            }

            setTimeout(() => {
                router.push('/admin/dashboard');
            }, 1500);
        } catch (error: any) {
            console.error('Error submitting product:', error);

            // Extract validation error messages
            let errorMessage = 'Inténtalo de nuevo';
            if (error.response?.data?.details) {
                const details = error.response.data.details;
                if (Array.isArray(details)) {
                    errorMessage = details.map((d: any) => d.message).join(', ');
                }
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error('Error al guardar producto', {
                description: errorMessage,
            });
        } finally {
            setSubmitting(false);
        }
    };

    const slideVariants = {
        enter: (dir: number) => ({
            x: dir > 0 ? 1000 : -1000,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (dir: number) => ({
            x: dir < 0 ? 1000 : -1000,
            opacity: 0,
        }),
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/dashboard">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="w-4 h-4" />
                                    Volver
                                </Button>
                            </Link>
                            <div className="h-8 w-px bg-gray-300"></div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <Sparkles className="w-6 h-6 text-green-600" />
                                    {mode === 'edit' ? 'Editar Producto' : 'Crear Producto'}
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Paso {currentStep} de {STEPS.length}
                                </p>
                            </div>
                        </div>

                        <Button onClick={handleSubmit} size="lg" disabled={submitting}>
                            <Save className="w-5 h-5" />
                            {submitting
                                ? 'Guardando...'
                                : mode === 'edit' ? 'Actualizar Producto' : 'Publicar Producto'}
                        </Button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                            {STEPS.map((step, index) => (
                                <div
                                    key={step.number}
                                    className={`flex items-center ${index < STEPS.length - 1 ? 'flex-1' : ''}`}
                                >
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${currentStep >= step.number
                                                ? 'bg-green-600 text-white shadow-lg'
                                                : 'bg-gray-200 text-gray-500'
                                                }`}
                                        >
                                            {currentStep > step.number ? (
                                                <Check className="w-5 h-5" />
                                            ) : (
                                                step.number
                                            )}
                                        </div>
                                        <div className="mt-2 text-center">
                                            <p className={`text-sm font-semibold ${currentStep >= step.number ? 'text-green-600' : 'text-gray-500'}`}>
                                                {step.title}
                                            </p>
                                            <p className="text-xs text-gray-400">{step.description}</p>
                                        </div>
                                    </div>

                                    {index < STEPS.length - 1 && (
                                        <div className="flex-1 h-1 mx-4 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-green-600 transition-all duration-500 ${currentStep > step.number ? 'w-full' : 'w-0'
                                                    }`}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* LEFT: Form Steps */}
                    <div className="relative">
                        <AnimatePresence initial={false} custom={direction} mode="wait">
                            <motion.div
                                key={currentStep}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: 'spring', stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.2 },
                                }}
                            >
                                {currentStep === 1 && (
                                    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                            Configuración de Portada
                                        </h2>

                                        <div className="space-y-6">
                                            {/* Name */}
                                            <div>
                                                <Label htmlFor="name">
                                                    Nombre del Producto <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    {...register('name')}
                                                    id="name"
                                                    placeholder="Ej: Batido Nutricional Formula 1"
                                                />
                                            </div>

                                            {/* Featured Toggle */}
                                            <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                                                <input
                                                    {...register('featured')}
                                                    type="checkbox"
                                                    id="featured"
                                                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                />
                                                <Label htmlFor="featured" className="mb-0 flex items-center gap-2">
                                                    ⭐ Marcar como Producto Destacado
                                                </Label>
                                            </div>

                                            {/* Categories */}
                                            <div>
                                                <Label>
                                                    Categoría <span className="text-red-500">*</span>
                                                </Label>
                                                <CategorySelector
                                                    selectedCategoryId={formData.categoryId}
                                                    onChange={(categoryId) => setValue('categoryId', categoryId)}
                                                />
                                            </div>

                                            {/* Main Image */}
                                            <div>
                                                <ImageUpload
                                                    label="Imagen Principal *"
                                                    value={formData.mainImage}
                                                    onChange={(url, file) => {
                                                        setValue('mainImage', url);
                                                        if (file) {
                                                            setImageFiles(prev => {
                                                                const newFiles = [...prev];
                                                                newFiles[0] = file;
                                                                return newFiles;
                                                            });
                                                        } else {
                                                            setImageFiles(prev => prev.filter((_, i) => i !== 0));
                                                        }
                                                    }}
                                                />
                                            </div>

                                            {/* Short Description */}
                                            <div>
                                                <Label htmlFor="shortDescription">
                                                    Descripción Corta <span className="text-red-500">*</span>
                                                </Label>
                                                <Textarea
                                                    {...register('shortDescription')}
                                                    id="shortDescription"
                                                    rows={3}
                                                    placeholder="Descripción breve que aparecerá en la tarjeta..."
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Aparecerá en la tarjeta del producto
                                                </p>
                                            </div>

                                            {/* Navigation */}
                                            <div className="flex justify-end pt-4">
                                                <Button onClick={handleNext} size="lg">
                                                    Siguiente Paso
                                                    <ArrowRight className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                            Detalles Profundos
                                        </h2>

                                        <div className="space-y-6">
                                            {/* Full Description */}
                                            <div>
                                                <Label htmlFor="fullDescription">
                                                    Descripción Completa <span className="text-red-500">*</span>
                                                </Label>
                                                <Textarea
                                                    {...register('fullDescription')}
                                                    id="fullDescription"
                                                    rows={6}
                                                    placeholder="Descripción detallada del producto..."
                                                />
                                            </div>

                                            {/* Secondary Images */}
                                            <div>
                                                <Label>Imágenes Adicionales (Opcional)</Label>
                                                <p className="text-sm text-gray-500 mb-3">
                                                    Puedes agregar hasta 4 imágenes adicionales
                                                </p>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {[0, 1, 2, 3].map((index) => (
                                                        <ImageUpload
                                                            key={index}
                                                            label={`Imagen ${index + 2}`}
                                                            value={formData.secondaryImages[index] || ''}
                                                            onChange={(url, file) => {
                                                                const newSecondaryImages = [...formData.secondaryImages];
                                                                if (url) {
                                                                    newSecondaryImages[index] = url;
                                                                } else {
                                                                    newSecondaryImages.splice(index, 1);
                                                                }
                                                                setValue('secondaryImages', newSecondaryImages);

                                                                if (file) {
                                                                    // Store file at index + 1 (after main image)
                                                                    setImageFiles(prev => {
                                                                        const newFiles = [...prev];
                                                                        newFiles[index + 1] = file;
                                                                        return newFiles.filter(Boolean); // Remove empty slots
                                                                    });
                                                                }
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Flavors */}
                                            <div>
                                                <Label>Sabores (Opcional)</Label>
                                                {formData.flavors.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {formData.flavors.map((flavor: string) => (
                                                            <span
                                                                key={flavor}
                                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-lg font-medium text-sm"
                                                            >
                                                                {flavor}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeFlavor(flavor)}
                                                                    className="hover:bg-purple-200 rounded-full p-0.5"
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={flavorInput}
                                                        onChange={(e) => setFlavorInput(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFlavor())}
                                                        placeholder="Ej: Vainilla, Chocolate..."
                                                    />
                                                    <Button type="button" onClick={addFlavor} variant="outline">
                                                        Agregar
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Benefits */}
                                            <div>
                                                <Label>
                                                    Beneficios <span className="text-red-500">*</span>
                                                </Label>
                                                {formData.benefits.length > 0 && (
                                                    <ul className="space-y-2 mb-3">
                                                        {formData.benefits.map((benefit: string, index: number) => (
                                                            <li
                                                                key={index}
                                                                className="flex items-start gap-2 p-3 bg-green-50 rounded-lg"
                                                            >
                                                                <span className="flex-1 text-sm text-gray-700">
                                                                    {benefit}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeBenefit(benefit)}
                                                                    className="text-red-500 hover:bg-red-100 rounded-full p-1"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={benefitInput}
                                                        onChange={(e) => setBenefitInput(e.target.value)}
                                                        onKeyDown={(e) =>
                                                            e.key === 'Enter' && (e.preventDefault(), addBenefit())
                                                        }
                                                        placeholder="Ej: Alto en proteínas..."
                                                    />
                                                    <Button type="button" onClick={addBenefit} variant="outline">
                                                        Agregar
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Navigation */}
                                            <div className="flex justify-between pt-4">
                                                <Button onClick={handleBack} variant="ghost">
                                                    <ArrowLeft className="w-5 h-5" />
                                                    Atrás
                                                </Button>

                                                <Button onClick={handleSubmit} size="lg" variant="success" disabled={submitting}>
                                                    <Save className="w-5 h-5" />
                                                    {submitting
                                                        ? 'Guardando...'
                                                        : mode === 'edit' ? 'Actualizar Producto' : 'Publicar Producto'}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* RIGHT: Preview Panel (Sticky) */}
                    <div className="lg:sticky lg:top-32 h-fit">
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
                                <h3 className="text-lg font-bold">Vista Previa</h3>
                                <p className="text-sm text-green-100">
                                    {currentStep === 1 ? 'Tarjeta del Producto' : 'Página de Detalle'}
                                </p>
                            </div>

                            <div className="p-6 bg-gray-50 min-h-[600px]">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentStep}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {currentStep === 1 ? (
                                            <div className="max-w-sm mx-auto">
                                                <ProductCard product={previewProduct} isPreview />
                                            </div>
                                        ) : (
                                            <div className="max-w-full">
                                                <ProductDetailView product={previewProduct} />
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
