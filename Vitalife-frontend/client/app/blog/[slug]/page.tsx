import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { blogPosts, getPostBySlug, formatDate } from '@/lib/mock-blog';
import { PostRenderer } from '@/components/blog/PostRenderer';
import { ArrowLeft, Clock, User } from 'lucide-react';

interface BlogPostPageProps {
    params: Promise<{ slug: string }>;
}

// Generate static params for all posts
export async function generateStaticParams() {
    return blogPosts.map((post) => ({
        slug: post.slug,
    }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) {
        return {
            title: 'Artículo no encontrado | Club Vitalife',
        };
    }

    return {
        title: `${post.title} | Blog Vitalife`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            images: [post.coverImage],
            type: 'article',
            publishedTime: post.publishedAt,
            authors: [post.author],
        },
    };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-white">
            {/* Back Navigation */}
            <div className="bg-gray-50 border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al Blog
                    </Link>
                </div>
            </div>

            {/* Article Header */}
            <article>
                <header className="container mx-auto px-4 py-12 md:py-16 text-center max-w-4xl">
                    {/* Category Badge */}
                    <span className="inline-block bg-green-100 text-green-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
                        {post.category}
                    </span>

                    {/* Title */}
                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                        {post.title}
                    </h1>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center justify-center gap-6 text-gray-500">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{post.readTime} de lectura</span>
                        </div>
                        <time dateTime={post.publishedAt} className="text-gray-500">
                            {formatDate(post.publishedAt)}
                        </time>
                    </div>
                </header>

                {/* Cover Image */}
                <div className="container mx-auto px-4 mb-12">
                    <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl max-w-5xl mx-auto">
                        <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1280px) 100vw, 1200px"
                            priority
                        />
                    </div>
                </div>

                {/* Article Content */}
                <div className="container mx-auto px-4 pb-20">
                    <div className="max-w-3xl mx-auto">
                        <PostRenderer content={post.content} />

                        {/* Share & CTA Section */}
                        <div className="mt-16 pt-10 border-t border-gray-200">
                            {/* Author Card */}
                            <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl p-8 mb-10">
                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                        CV
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                            {post.author}
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            Distribuidor Independiente Herbalife. Te ayudo a alcanzar tus metas de bienestar con un enfoque personalizado.
                                        </p>
                                        <a
                                            href="https://wa.me/525512345678?text=Hola,%20vi%20tu%20artículo%20y%20quiero%20más%20información"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#25D366] text-white font-semibold rounded-full hover:bg-[#20BA5A] transition-all"
                                        >
                                            Contactar por WhatsApp
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Related Posts Placeholder */}
                            <div className="text-center">
                                <Link
                                    href="/blog"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 transition-all shadow-lg hover:shadow-xl"
                                >
                                    Ver Más Artículos
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </main>
    );
}
