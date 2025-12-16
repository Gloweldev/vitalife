import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ListProvider } from "@/context/ListContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Club Vitalife - Tu Transformación Comienza Aquí",
  description: "Distribuidor Independiente de Herbalife. Productos premium de nutrición y bienestar con asesoría personalizada para alcanzar tus objetivos de salud.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ListProvider>
          <Header />
          {children}
          <Footer />
        </ListProvider>
      </body>
    </html>
  );
}
