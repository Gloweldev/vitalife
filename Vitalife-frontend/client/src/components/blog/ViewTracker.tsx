'use client';

import { useViewTracker } from '@/hooks/useViewTracker';

interface ViewTrackerProps {
    slug: string;
}

/**
 * Client component that tracks post views
 * Drop into any server component page to enable view tracking
 */
export function ViewTracker({ slug }: ViewTrackerProps) {
    useViewTracker(slug);
    return null; // This component doesn't render anything
}
