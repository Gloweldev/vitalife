import Link from 'next/link';
import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Company Info */}
                    <div>
                        <h3 className="text-white text-xl font-bold mb-4">Club Vitalife</h3>
                        <p className="text-sm mb-4">
                            Tu aliado en el camino hacia una vida más saludable y equilibrada.
                            Distribuidor Independiente de Herbalife.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-green-500 transition-colors"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-green-500 transition-colors"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white text-lg font-semibold mb-4">Enlaces</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-sm hover:text-green-500 transition-colors">
                                    Inicio
                                </Link>
                            </li>
                            <li>
                                <Link href="/productos" className="text-sm hover:text-green-500 transition-colors">
                                    Productos
                                </Link>
                            </li>
                            <li>
                                <Link href="/apoyo" className="text-sm hover:text-green-500 transition-colors">
                                    Apoyo
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="text-sm hover:text-green-500 transition-colors">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="/legal" className="text-sm hover:text-green-500 transition-colors">
                                    Avisos Legales
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-white text-lg font-semibold mb-4">Contacto</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2 text-sm">
                                <MapPin className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>Ciudad de México, México</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm">
                                <Phone className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <a href="tel:+525512345678" className="hover:text-green-500 transition-colors">
                                    +52 55 1234 5678
                                </a>
                            </li>
                            <li className="flex items-center gap-2 text-sm">
                                <Mail className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <a href="mailto:contacto@clubvitalife.com" className="hover:text-green-500 transition-colors">
                                    contacto@clubvitalife.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-8 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                        <p>
                            &copy; {new Date().getFullYear()} Club Vitalife. Todos los derechos reservados.
                        </p>
                        <p className="text-xs text-gray-400">
                            Distribuidor Independiente de Herbalife. Los productos Herbalife no están destinados a diagnosticar, tratar, curar o prevenir ninguna enfermedad.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
