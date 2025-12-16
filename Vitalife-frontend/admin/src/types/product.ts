export interface ProductImage {
    id?: string;
    url: string;
    isMain: boolean;
    productId?: string;
}

export interface ProductBenefit {
    id?: string;
    text: string;
    productId?: string;
}

export interface ProductFlavor {
    id?: string;
    name: string;
    productId?: string;
}

export interface Category {
    id: string;
    name: string;
    productCount?: number;
}

export interface Product {
    id: string;
    name: string;
    categoryId?: string | null;
    category?: Category | null;
    images: ProductImage[];
    description: string;
    shortDescription: string;
    fullDescription: string;
    benefits: ProductBenefit[];
    flavors?: ProductFlavor[];
    isFeatured?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface ProductFormData {
    name: string;
    categoryId: string | null;
    mainImage: string;
    secondaryImages: string[];
    shortDescription: string;
    fullDescription: string;
    flavors: string[];
    benefits: string[];
    featured: boolean;
}
