'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Clipboard, Menu, X } from 'lucide-react';
import { useList } from '@/context/ListContext';

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { totalItems } = useList();

    return (
        <header className="w-full">
            {/* Compliance Top Bar - Required by Herbalife */}
            <div className="bg-black text-white py-2">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm font-medium">
                        Distribuidor Independiente de Herbalife
                    </p>
                </div>
            </div>

            {/* Main Navigation */}
            <nav className="bg-white shadow-md sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center">
                            <span className="text-2xl font-bold text-green-600">
                                Club Vitalife
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link
                                href="/"
                                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                            >
                                Inicio
                            </Link>
                            <Link
                                href="/productos"
                                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                            >
                                Productos
                            </Link>
                            <Link
                                href="/apoyo"
                                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                            >
                                Apoyo
                            </Link>
                            <Link
                                href="/blog"
                                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                            >
                                Blog
                            </Link>
                        </div>

                        {/* Action Button - Mi Lista (NOT shopping cart) */}
                        <div className="flex items-center gap-4">
                            <Link href="/mi-lista" className="relative inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                <Clipboard className="w-5 h-5" />
                                <span className="hidden sm:inline font-medium">Mi Lista</span>
                                {/* Badge with count */}
                                {totalItems > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {totalItems}
                                    </span>
                                )}
                            </Link>

                            {/* Mobile Menu Button */}
                            <button
                                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? (
                                    <X className="w-6 h-6 text-gray-700" />
                                ) : (
                                    <Menu className="w-6 h-6 text-gray-700" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 border-t">
                            <div className="flex flex-col space-y-4">
                                <Link
                                    href="/"
                                    className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Inicio
                                </Link>
                                <Link
                                    href="/productos"
                                    className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Productos
                                </Link>
                                <Link
                                    href="/apoyo"
                                    className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Apoyo
                                </Link>
                                <Link
                                    href="/blog"
                                    className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Blog
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
}
