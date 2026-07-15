import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import LayoutWrapper from '@/components/LayoutWrapper';
import { Toaster } from 'react-hot-toast';

// Inter for body text, Playfair Display (Serif) for headings
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Zaiqa - Authentic Restaurant Experience',
  description: 'Manage and enjoy the finest dining experience.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="bg-basmati text-ink font-sans antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <Toaster position="top-center" />
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
