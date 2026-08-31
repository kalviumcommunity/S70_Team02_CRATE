import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CRATE - Contributor Retention Analytics & Tracking Engine',
  description: 'AI & Machine Learning Engine predicting open-source contributor retention and onboarding health.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased font-sans min-h-screen selection:bg-indigo-500 selection:text-white">
        <div className="relative min-h-screen overflow-x-hidden">
          {/* Subtle background glow accents */}
          <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/15 blur-[128px]" />
          <div className="pointer-events-none absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-[128px]" />
          <div className="pointer-events-none absolute bottom-10 left-1/4 h-96 w-96 rounded-full bg-purple-600/10 blur-[128px]" />

          {children}
        </div>
      </body>
    </html>
  );
}
