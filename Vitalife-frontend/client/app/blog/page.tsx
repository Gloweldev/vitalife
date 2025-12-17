import { Metadata } from 'next';
import { blogPosts } from '@/lib/mock-blog';
import { BlogHero } from '@/components/blog/BlogHero';
import { BlogCard } from '@/components/blog/BlogCard';

export const metadata: Metadata = {
    title: 'Blog Vitalife & Recetas | Club Vitalife',
    description: 'Descubre recetas saludables, consejos de nutrición y rutinas de ejercicio para transformar tu estilo de vida.',
};

export default function BlogPage() {
    const [heroPost, ...restPosts] = blogPosts;

    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
            {/* Elegant Header */}
            <section className="bg-white border-b border-gray-100">
                <div className="container mx-auto px-4 py-12 md:py-16 text-center">
                    <span className="inline-block text-green-600 text-sm font-semibold uppercase tracking-widest mb-4">
                        Revista Digital
                    </span>
                    <h1 className="font-serif text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                        Blog Vitalife
                    </h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Descubre recetas deliciosas, consejos de nutrición y tips para transformar tu bienestar.
                    </p>
                </div>
            </section>

            {/* Category Navigation */}
            <section className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-100">
                <div className="container mx-auto px-4 py-4">
                    <nav className="flex items-center justify-center gap-2 overflow-x-auto">
                        <button className="px-5 py-2 rounded-full bg-gray-900 text-white text-sm font-medium transition-all whitespace-nowrap">
                            Todos
                        </button>
                        <button className="px-5 py-2 rounded-full bg-white text-gray-700 text-sm font-medium border border-gray-200 hover:border-green-600 hover:text-green-600 transition-all whitespace-nowrap">
                            Recetas
                        </button>
                        <button className="px-5 py-2 rounded-full bg-white text-gray-700 text-sm font-medium border border-gray-200 hover:border-green-600 hover:text-green-600 transition-all whitespace-nowrap">
                            Nutrición
                        </button>
                        <button className="px-5 py-2 rounded-full bg-white text-gray-700 text-sm font-medium border border-gray-200 hover:border-green-600 hover:text-green-600 transition-all whitespace-nowrap">
                            Fitness
                        </button>
                        <button className="px-5 py-2 rounded-full bg-white text-gray-700 text-sm font-medium border border-gray-200 hover:border-green-600 hover:text-green-600 transition-all whitespace-nowrap">
                            Bienestar
                        </button>
                    </nav>
                </div>
            </section>

            {/* Content */}
            <section className="container mx-auto px-4 py-12 md:py-16">
                {/* Hero Post - Full Width Featured */}
                {heroPost && (
                    <div className="mb-12 md:mb-16">
                        <BlogHero post={heroPost} />
                    </div>
                )}

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {restPosts.map((post, index) => {
                        // Create visual variety based on index
                        if (index === 0) {
                            // First remaining post: Vertical card spanning 2 rows on desktop
                            return (
                                <div key={post.slug} className="lg:row-span-2">
                                    <BlogCard post={post} variant="vertical" />
                                </div>
                            );
                        }

                        if (index === 1) {
                            // Second post: Horizontal card
                            return (
                                <div key={post.slug} className="lg:col-span-2">
                                    <BlogCard post={post} variant="horizontal" />
                                </div>
                            );
                        }

                        // Rest: Vertical cards
                        return (
                            <div key={post.slug}>
                                <BlogCard post={post} variant="vertical" />
                            </div>
                        );
                    })}
                </div>

                {/* More Posts Section */}
                {blogPosts.length > 6 && (
                    <div className="mt-16 text-center">
                        <button className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-full border-2 border-gray-200 hover:border-gray-900 transition-all shadow-lg shadow-black/5 hover:shadow-xl">
                            Cargar Más Artículos
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                )}
            </section>

            {/* Newsletter Section */}
            <section className="bg-gray-900 text-white py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <span className="inline-block text-green-400 text-sm font-semibold uppercase tracking-widest mb-4">
                            Mantente Conectado
                        </span>
                        <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6">
                            ¿Quieres Más Tips de Bienestar?
                        </h2>
                        <p className="text-gray-400 text-lg mb-8">
                            Únete a nuestra comunidad y recibe recetas exclusivas, consejos de nutrición y ofertas especiales directamente en tu WhatsApp.
                        </p>
                        <a
                            href="https://wa.me/525512345678?text=Hola,%20quiero%20recibir%20tips%20de%20bienestar"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-green-500 text-white font-bold rounded-full hover:bg-green-400 transition-all shadow-xl hover:shadow-2xl hover:shadow-green-500/25"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Quiero Recibir Tips
                        </a>
                    </div>
                </div>
            </section>

            {/* Trending Topics Sidebar-like Section */}
            <section className="bg-white py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-4 mb-8">
                            <h3 className="font-serif text-2xl font-bold text-gray-900">
                                Temas Populares
                            </h3>
                            <div className="flex-1 h-px bg-gray-200" />
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {['Formula 1', 'Batidos Verdes', 'Pérdida de Peso', 'Recetas Fáciles', 'Proteína', 'Desayunos', 'Post-Entreno', 'Snacks Saludables'].map((topic) => (
                                <button
                                    key={topic}
                                    className="px-5 py-2.5 rounded-full bg-gray-100 text-gray-700 font-medium hover:bg-green-100 hover:text-green-700 transition-all duration-300"
                                >
                                    {topic}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
