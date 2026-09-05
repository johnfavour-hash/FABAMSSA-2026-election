'use client';

import dynamic from 'next/dynamic';

const LegacyElectionApp = dynamic(() => import('./legacy-election-app'), {
  ssr: false,
  loading: () => <main aria-busy="true" />,
});

export default function HomePage() {
  return <LegacyElectionApp />;
}