'use client';

import { useEffect, useRef } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Generate a simple browser fingerprint for view deduplication
 * This is NOT for tracking users across sites - only for same-day view deduplication
 */
function generateFingerprint(): string {
    const components: string[] = [];

    // Screen info
    components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);

    // Timezone
    components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

    // Language
    components.push(navigator.language);

    // Platform
    components.push(navigator.platform);

    // Number of CPU cores (if available)
    if (navigator.hardwareConcurrency) {
        components.push(String(navigator.hardwareConcurrency));
    }

    // Device memory (if available, Chrome only)
    if ('deviceMemory' in navigator) {
        components.push(String((navigator as unknown as { deviceMemory: number }).deviceMemory));
    }

    // Touch support
    components.push(String('ontouchstart' in window));

    // Simple hash function
    const str = components.join('|');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    return Math.abs(hash).toString(36);
}

/**
 * Custom hook to track post views with deduplication
 * Should be called once per post detail page load
 */
export function useViewTracker(slug: string | null) {
    const hasTracked = useRef(false);

    useEffect(() => {
        // Only run on client side and only once per page load
        if (!slug || hasTracked.current || typeof window === 'undefined') {
            return;
        }

        hasTracked.current = true;

        // Small delay to ensure page is loaded and not a bot pre-rendering
        const timeoutId = setTimeout(async () => {
            try {
                const fingerprint = generateFingerprint();
                const referrer = document.referrer || null;

                await fetch(`${API_BASE_URL}/store/posts/${slug}/view`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        fingerprint,
                        referrer,
                    }),
                    keepalive: true,
                });
            } catch {
                // Silent fail - view tracking should never break the page
            }
        }, 1000);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [slug]);
}

/**
 * API function to register view (for use outside of hooks)
 */
export async function registerView(slug: string): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
        const fingerprint = generateFingerprint();
        const referrer = document.referrer || null;

        const response = await fetch(`${API_BASE_URL}/store/posts/${slug}/view`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fingerprint, referrer }),
        });

        if (response.ok) {
            const data = await response.json();
            return data.counted === true;
        }
        return false;
    } catch {
        return false;
    }
}
