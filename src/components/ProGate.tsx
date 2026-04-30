import { ReactNode } from 'react';
import { useAuthStore } from '../stores/authStore';

interface ProGateProps {
  children: ReactNode;
  limitReached: boolean;
  onShowPaywall: () => void;
}

export function ProGate({ children, limitReached, onShowPaywall }: ProGateProps) {
  const { isPro } = useAuthStore.getState();

  if (!isPro && limitReached) {
    onShowPaywall();
    return null;
  }

  return <>{children}</>;
}

export const FREE_TIER_LIMITS = {
  activeProtocols: 1,
  inventoryItems: 1,
  doseLogs: 30,
};
