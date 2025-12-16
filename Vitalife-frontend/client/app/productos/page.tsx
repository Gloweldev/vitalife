import { Suspense } from 'react';
import Link from 'next/link';
import { Filter, Package, Search } from 'lucide-react';
import { ProductCard } from '@/components/ui/ProductCard';
import { SearchBar } from '@/components/store/SearchBar';
import { searchProducts, getProducts, getCategories } from '@/services/storeApi';
import { Product, Category } from '@/types';

interface ProductosPageProps {
    searchParams: Promise<{ q?: string; category?: string }>;
}

// Category Filter Component (Server Component)
async function CategoryFilter({
    categories,
    selectedCategory
}: {
    categories: Category[];
    selectedCategory?: string;
}) {
    return (
        <div className="flex gap-2 flex-wrap">
            <Link
                href="/productos"
                className={`px-6 py-2.5 rounded-full font-medium transition-all duration-200 ${!selectedCategory
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-600 hover:text-green-600'
                    }`}
            >
                Todos
            </Link>
            {categories.map(category => (
                <Link
                    key={category.id}
                    href={`/productos?category=${category.id}`}
                    className={`px-6 py-2.5 rounded-full font-medium transition-all duration-200 ${selectedCategory === category.id
                            ? 'bg-green-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-600 hover:text-green-600'
                        }`}
                >
                    {category.name}
                </Link>
            ))}
        </div>
    );
}

// Products Grid Component
function ProductsGrid({ products }: { products: Product[] }) {
    if (products.length === 0) {
        return (
            <div className="text-center py-20">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">
                    No encontramos productos con esos criterios.
                </p>
                <p className="text-gray-400 mb-6">
                    Intenta con otros términos o revisa todas las categorías.
                </p>
                <Link
                    href="/productos"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
                >
                    Ver todo el catálogo
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}

export default async function ProductosPage({ searchParams }: ProductosPageProps) {
    // Unwrap the searchParams promise (Next.js 14+)
    const params = await searchParams;
    const searchQuery = params.q || '';
    const categoryId = params.category || '';

    // Fetch data
    const [categories, products] = await Promise.all([
        getCategories(),
        searchQuery
            ? searchProducts(searchQuery, categoryId)
            : getProducts({ categoryId: categoryId || undefined }).then(data => data.products),
    ]);

    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Header Section */}
            <section className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-16 md:py-24">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                            Catálogo de{' '}
                            <span className="text-green-600 bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">
                                Nutrición
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed mb-8">
                            Productos premium de Herbalife con calidad garantizada y respaldo científico.
                            Cada producto está diseñado para apoyar tu bienestar integral.
                        </p>

                        {/* Search Bar */}
                        <div className="flex justify-center">
                            <Suspense fallback={<div className="w-full max-w-md h-14 bg-gray-100 rounded-full animate-pulse" />}>
                                <SearchBar />
                            </Suspense>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filters and Products Grid */}
            <section className="container mx-auto px-4 py-12">
                {/* Filter Bar */}
                <div className="mb-12">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2 text-gray-700 font-medium">
                            <Filter className="w-5 h-5" />
                            <span>Categoría:</span>
                        </div>
                        <CategoryFilter
                            categories={categories}
                            selectedCategory={categoryId}
                        />
                    </div>

                    <div className="mt-4 text-sm text-gray-600">
                        {searchQuery && (
                            <span className="mr-2">
                                Resultados para: <strong className="text-gray-900">"{searchQuery}"</strong>
                            </span>
                        )}
                        <span>
                            Mostrando <span className="font-semibold text-gray-900">{products.length}</span> productos
                        </span>
                    </div>
                </div>

                {/* Products Grid */}
                <ProductsGrid products={products} />
            </section>

            {/* Call to Action */}
            <section className="container mx-auto px-4 py-16 mb-16">
                <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-3xl p-12 text-center text-white shadow-2xl">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        ¿Necesitas Asesoría Personalizada?
                    </h2>
                    <p className="text-xl text-green-50 mb-8 max-w-2xl mx-auto">
                        Nuestro equipo está listo para ayudarte a seleccionar los productos perfectos para tus objetivos.
                    </p>
                    <a
                        href="https://wa.me/525512345678?text=Hola,%20necesito%20asesoría%20sobre%20productos%20Vitalife"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full bg-white text-green-600 hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                        Contactar por WhatsApp
                    </a>
                </div>
            </section>
        </main>
    );
}
