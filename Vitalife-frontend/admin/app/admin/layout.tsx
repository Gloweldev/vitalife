import { Inter } from "next/font/google";
import "../globals.css";
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AuthProvider>
                    <Toaster position="top-right" richColors />
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
