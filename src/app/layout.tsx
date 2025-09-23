import type { Metadata, Viewport } from "next";
import "./globals.css";
// import { AuthModalProvider } from "@/components/auth/QuickAuthModal";
import { MagicLinkModal } from "@/components/auth/MagicLinkModal";

// Force all routes to be dynamic to avoid SSG issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "Decollage.cl | La confianza para diseñar el hogar que amas",
  description: "Tu refugio de diseño consciente. Descubre piezas únicas que transforman tu hogar en un santuario de bienestar y elegancia natural. Colecciones curadas con la filosofía de Elegancia Natural.",
  keywords: "diseño interior, decoración consciente, muebles artesanales, elegancia natural, hogar santuario, Chile, decoración sustentable",
  authors: [{ name: "Decollage.cl" }],
  openGraph: {
    title: "Decollage.cl | Elegancia Natural para tu Hogar",
    description: "Diseño consciente que transforma tu hogar en un santuario. Piezas únicas con la filosofía de Elegancia Natural.",
    url: "https://decollage.cl",
    siteName: "Decollage.cl",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Decollage.cl - Elegancia Natural",
      },
    ],
    locale: "es_CL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Decollage.cl | Elegancia Natural para tu Hogar",
    description: "Diseño consciente que transforma tu hogar en un santuario de bienestar y elegancia natural.",
    images: ["/og-image.jpg"],
  },
  robots: "index, follow",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className="antialiased"
      >
        {children}
        <MagicLinkModal />
      </body>
    </html>
  );
}
