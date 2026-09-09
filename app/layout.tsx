import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import '../src/index.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
});

export const metadata: Metadata = {
  title: 'FABAMSSA UNIPORT Elections 2026',
  description: 'Official democratic voting and electoral integrity platform for FABAMSSA UNIPORT Chapter.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={plusJakartaSans.className}>
      <body className={plusJakartaSans.className}>{children}</body>
    </html>
  );
}