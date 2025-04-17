'use client';

import { ErrorBoundary } from '../components/ErrorBoundary';
import { SessionTimeout } from '../contexts/SessionTimeout';

export default function WalletLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <div>
        {children}
        <SessionTimeout />
      </div>
    </ErrorBoundary>
  );
}