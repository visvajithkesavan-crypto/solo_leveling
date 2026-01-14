import type { Metadata } from 'next';
import { Inter, Rajdhani } from 'next/font/google';
import './globals.css';
import '@/styles/system.css';
import { AuthProvider } from '@/lib/auth-context';
import { SystemMessageProvider } from '@/hooks/useSystemMessage';
import SystemMessageDisplay from '@/components/SystemMessageDisplay';

const inter = Inter({ subsets: ['latin'] });
const rajdhani = Rajdhani({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-rajdhani',
});

export const metadata: Metadata = {
  title: 'Solo Leveling System',
  description: 'Gamified self-development platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${rajdhani.variable} bg-system-bg text-system-text min-h-screen`}>
        <AuthProvider>
          <SystemMessageProvider>
            {children}
            <SystemMessageDisplay />
          </SystemMessageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
