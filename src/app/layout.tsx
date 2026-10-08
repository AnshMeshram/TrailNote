import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PwaRegistrar } from '@/components/layout/PwaRegistrar';

export const metadata: Metadata = {
  title: 'Trailnote — Plan the walk. Make the note. Put the phone away.',
  description:
    'A local-AI outdoor trail companion built with Gemma 2. Prepare a practical outdoor plan and printable field card, then put your screen away and explore nature.',
  keywords: [
    'hiking',
    'trail companion',
    'field notebook',
    'outdoor planner',
    'local AI',
    'Gemma 2',
    'touch grass',
    'Hacktoberfest 2026',
    'printable trail card',
  ],
  authors: [{ name: 'Trailnote Naturalist Guild' }],
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/images/trailnote-icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..800&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3A6704" />
      </head>
      <body>
        <PwaRegistrar />
        <Navigation />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
