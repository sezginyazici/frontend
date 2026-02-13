import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export const metadata: Metadata = {
  title: "Prometre - Tedarikçi ve Müşteri Buluşma Noktası",
  description: "Promosyon ürünleri için en iyi teklifleri alın.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        <AuthProvider>
          <div className="pt-14"></div>
          <Navbar />
          <main className=" py-4">
            {children}
          </main>
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}