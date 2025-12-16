'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types';

interface ListItem {
    product: Product;
    quantity: number;
    flavor?: string; // NEW: flavor variant
}

interface ListContextType {
    items: ListItem[];
    addToList: (product: Product, flavor?: string) => void;
    removeFromList: (productId: string, flavor?: string) => void;
    updateQuantity: (productId: string, quantity: number, flavor?: string) => void;
    clearList: () => void;
    isInList: (productId: string, flavor?: string) => boolean;
    getQuantity: (productId: string, flavor?: string) => number;
    totalItems: number;
    itemCount: number;
}

const ListContext = createContext<ListContextType | undefined>(undefined);

export function ListProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<ListItem[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('vitalife-list');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);

                // Migration: Handle old formats
                if (Array.isArray(parsed) && parsed.length > 0) {
                    const firstItem = parsed[0];

                    // Old format without flavor support
                    if (firstItem.id && !firstItem.product) {
                        console.log('Migrating old list format');
                        const migratedItems: ListItem[] = parsed.map((product: Product) => ({
                            product,
                            quantity: 1
                        }));
                        setItems(migratedItems);
                        localStorage.setItem('vitalife-list', JSON.stringify(migratedItems));
                    } else if (firstItem.product) {
                        // New format - use as is (will have flavor field if applicable)
                        setItems(parsed);
                    } else {
                        console.warn('Invalid list format, clearing');
                        localStorage.removeItem('vitalife-list');
                        setItems([]);
                    }
                } else {
                    setItems(parsed || []);
                }
            } catch (error) {
                console.error('Error loading list:', error);
                localStorage.removeItem('vitalife-list');
                setItems([]);
            }
        }
        setIsInitialized(true);
    }, []);

    // Save to localStorage whenever items change
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('vitalife-list', JSON.stringify(items));
        }
    }, [items, isInitialized]);

    // Helper: Check if two items are the same (productId + flavor)
    const isSameItem = (item: ListItem, productId: string, flavor?: string) => {
        return item.product.id === productId && item.flavor === flavor;
    };

    const addToList = (product: Product, flavor?: string) => {
        setItems(prev => {
            const existingItem = prev.find(item => isSameItem(item, product.id, flavor));
            if (existingItem) {
                // Item already in list - increment quantity
                return prev.map(item =>
                    isSameItem(item, product.id, flavor)
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            // Add new item
            return [...prev, { product, quantity: 1, flavor }];
        });
    };

    const removeFromList = (productId: string, flavor?: string) => {
        setItems(prev => prev.filter(item => !isSameItem(item, productId, flavor)));
    };

    const updateQuantity = (productId: string, quantity: number, flavor?: string) => {
        if (quantity <= 0) {
            removeFromList(productId, flavor);
            return;
        }

        setItems(prev =>
            prev.map(item =>
                isSameItem(item, productId, flavor)
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const clearList = () => {
        setItems([]);
    };

    const isInList = (productId: string, flavor?: string) => {
        return items.some(item => isSameItem(item, productId, flavor));
    };

    const getQuantity = (productId: string, flavor?: string) => {
        const item = items.find(item => isSameItem(item, productId, flavor));
        return item ? item.quantity : 0;
    };

    // Calculate total items (sum of all quantities)
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    // Number of unique items (including flavor variants)
    const itemCount = items.length;

    const value: ListContextType = {
        items,
        addToList,
        removeFromList,
        updateQuantity,
        clearList,
        isInList,
        getQuantity,
        totalItems,
        itemCount,
    };

    return <ListContext.Provider value={value}>{children}</ListContext.Provider>;
}

export function useList() {
    const context = useContext(ListContext);
    if (context === undefined) {
        throw new Error('useList must be used within a ListProvider');
    }
    return context;
}
