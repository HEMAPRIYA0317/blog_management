import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'BlogVerse — Share Your Stories',
  description: 'A modern blogging platform where ideas come to life. Create, share, and explore stories from writers around the world.',
  keywords: ['blog', 'writing', 'stories', 'articles', 'community'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="page-wrapper">
            <Navbar />
            <main className="main-content">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
