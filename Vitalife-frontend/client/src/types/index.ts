export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryId?: string | null;
  images: string[];
  description: string;
  shortDescription: string;
  fullDescription: string;
  benefits: string[];
  flavors?: string[];
  isFeatured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  productCount?: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
