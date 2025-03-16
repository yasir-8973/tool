import './styles.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Power Tools Billing App',
  description: 'A billing application for power tools shop',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-100 print:bg-white">
          <div className="print:hidden">
            <Navbar />
          </div>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
