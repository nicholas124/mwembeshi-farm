import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import SessionProvider from '@/components/providers/SessionProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mwembeshi Farm Management',
  description: 'Farm management system for livestock, crops, workers, and equipment',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Mwembeshi Farm',
  },
  formatDetection: {
    telephone: false,
  },
  keywords: ['farm', 'management', 'livestock', 'crops', 'Zambia', 'agriculture'],
  authors: [{ name: 'Mwembeshi Farm' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#16a34a' },
    { media: '(prefers-color-scheme: dark)', color: '#15803d' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <div id="offline-indicator" className="offline-indicator hidden">
            You are offline. Changes will sync when connected.
          </div>
          {children}
        </SessionProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('online', () => {
                document.getElementById('offline-indicator').classList.add('hidden');
              });
              window.addEventListener('offline', () => {
                document.getElementById('offline-indicator').classList.remove('hidden');
              });
              if (!navigator.onLine) {
                document.getElementById('offline-indicator').classList.remove('hidden');
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
