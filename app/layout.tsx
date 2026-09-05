import type { Metadata } from 'next';
import '../src/index.css';

export const metadata: Metadata = {
  title: 'BAMSSA Elections 2026',
  description: 'BAMSSA election portal',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}