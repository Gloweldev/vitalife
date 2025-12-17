'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Newspaper, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
    {
        label: 'Productos',
        href: '/admin/dashboard',
        icon: Package,
    },
    {
        label: 'Blog',
        href: '/admin/blog',
        icon: Newspaper,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { signOut } = useAuth();

    const isActive = (href: string) => {
        if (href === '/admin/dashboard') {
            return pathname === '/admin/dashboard' || pathname === '/admin';
        }
        return pathname.startsWith(href);
    };

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-gray-900 text-white flex flex-col z-50">
            {/* Logo */}
            <div className="p-6 border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-green-500/25">
                        V
                    </div>
                    <div>
                        <h1 className="font-bold text-lg">Club Vitalife</h1>
                        <p className="text-xs text-gray-400">Panel de Admin</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active
                                ? 'bg-green-600 text-white shadow-lg shadow-green-600/25'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={signOut}
                    className="flex items-center gap-3 w-full px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all duration-200"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
}
