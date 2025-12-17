import Image from 'next/image';
import Link from 'next/link';
import { BlogPost, formatDate } from '@/lib/mock-blog';
import { Clock } from 'lucide-react';

interface BlogHeroProps {
    post: BlogPost;
}

export function BlogHero({ post }: BlogHeroProps) {
    return (
        <Link href={`/blog/${post.slug}`} className="group block">
            <article className="relative w-full h-[500px] md:h-[600px] rounded-3xl overflow-hidden">
                {/* Background Image */}
                <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="100vw"
                    priority
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 lg:p-16">
                    {/* Category & Read Time */}
                    <div className="flex items-center gap-4 mb-4">
                        <span className="bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide shadow-lg">
                            {post.category}
                        </span>
                        <span className="flex items-center gap-1.5 text-white/80 text-sm">
                            <Clock className="w-4 h-4" />
                            {post.readTime}
                        </span>
                    </div>

                    {/* Title - Serif Font for Editorial Feel */}
                    <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight max-w-4xl group-hover:text-green-300 transition-colors duration-300">
                        {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-white/80 text-lg md:text-xl max-w-2xl mb-6 line-clamp-2">
                        {post.excerpt}
                    </p>

                    {/* Author & Date */}
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            CV
                        </div>
                        <div>
                            <p className="text-white font-semibold">{post.author}</p>
                            <time dateTime={post.publishedAt} className="text-white/60 text-sm">
                                {formatDate(post.publishedAt)}
                            </time>
                        </div>
                    </div>
                </div>

                {/* Hover Indicator */}
                <div className="absolute top-8 right-8 bg-white/20 backdrop-blur-sm rounded-full p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </div>
            </article>
        </Link>
    );
}
