import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ListProvider } from '@/context/ListContext';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-sans',
    display: 'swap',
});

const playfairDisplay = Playfair_Display({
    subsets: ['latin'],
    variable: '--font-serif',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'Club Vitalife | Distribuidor Independiente Herbalife',
    description: 'Tu camino hacia un estilo de vida más saludable comienza aquí. Productos de nutrición premium y asesoría personalizada.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es" className={`${inter.variable} ${playfairDisplay.variable}`}>
            <body className="font-sans antialiased">
                <ListProvider>
                    <Header />
                    {children}
                    <Footer />
                </ListProvider>
            </body>
        </html>
    );
}
