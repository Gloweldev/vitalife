'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface AdminShellProps {
    children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="ml-64">
                {children}
            </main>
        </div>
    );
}
