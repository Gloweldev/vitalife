import Image from 'next/image';
import Link from 'next/link';
import { BlogPost, formatDate } from '@/lib/mock-blog';
import { Clock } from 'lucide-react';

interface BlogCardProps {
    post: BlogPost;
    variant?: 'vertical' | 'horizontal' | 'compact';
}

export function BlogCard({ post, variant = 'vertical' }: BlogCardProps) {
    if (variant === 'horizontal') {
        return <HorizontalCard post={post} />;
    }

    if (variant === 'compact') {
        return <CompactCard post={post} />;
    }

    return <VerticalCard post={post} />;
}

function VerticalCard({ post }: { post: BlogPost }) {
    return (
        <Link href={`/blog/${post.slug}`} className="group block h-full">
            <article className="bg-white rounded-2xl overflow-hidden h-full flex flex-col shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-500 hover:-translate-y-1">
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 400px"
                    />

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
                            {post.category}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 flex flex-col">
                    {/* Title - Serif */}
                    <h3 className="font-serif text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-green-600 transition-colors duration-300">
                        {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                        {post.excerpt}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{post.readTime}</span>
                        </div>
                        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                    </div>
                </div>
            </article>
        </Link>
    );
}

function HorizontalCard({ post }: { post: BlogPost }) {
    return (
        <Link href={`/blog/${post.slug}`} className="group block">
            <article className="bg-white rounded-2xl overflow-hidden shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-500 hover:-translate-y-1">
                <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    <div className="relative w-full sm:w-48 md:w-64 h-48 sm:h-auto flex-shrink-0 overflow-hidden">
                        <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, 256px"
                        />

                        {/* Category Badge */}
                        <div className="absolute top-4 left-4 sm:hidden">
                            <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1.5 rounded-full">
                                {post.category}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 flex flex-col justify-center">
                        {/* Category - Desktop Only */}
                        <div className="hidden sm:block mb-2">
                            <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
                                {post.category}
                            </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-serif text-lg md:text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors duration-300">
                            {post.title}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2 hidden md:block">
                            {post.excerpt}
                        </p>

                        {/* Meta */}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                <span>{post.readTime}</span>
                            </div>
                            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
}

function CompactCard({ post }: { post: BlogPost }) {
    return (
        <Link href={`/blog/${post.slug}`} className="group block">
            <article className="flex items-center gap-4 p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors duration-300">
                {/* Image */}
                <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                    <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="80px"
                    />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                        {post.category}
                    </span>
                    <h4 className="font-serif text-base font-bold text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors">
                        {post.title}
                    </h4>
                    <time dateTime={post.publishedAt} className="text-xs text-gray-500">
                        {formatDate(post.publishedAt)}
                    </time>
                </div>
            </article>
        </Link>
    );
}
