import { ProductCarousel } from './ProductCarousel';
import { getFeaturedProducts } from '@/services/storeApi';

export async function ProductShowcase() {
    // Fetch featured products from API with ISR caching
    const products = await getFeaturedProducts();

    return <ProductCarousel products={products} />;
}
