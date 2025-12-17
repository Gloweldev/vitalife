import { BlogEditor } from '@/components/admin/blog/BlogEditor';

interface EditBlogPostPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
    const { id } = await params;

    return <BlogEditor postId={id} />;
}
