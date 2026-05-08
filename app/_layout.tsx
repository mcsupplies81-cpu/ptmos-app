import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { initPurchases } from '@/lib/purchases';
import { scheduleDoseReminders } from '@/lib/notifications';
import { useProtocolStore } from '@/stores/protocolStore';
import ErrorBoundary from '@/components/ErrorBoundary';
import OfflineBanner from '@/components/OfflineBanner';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { session, loading, setSession, setLoading } = useAuthStore();
  const { profile, fetchProfile } = useProfileStore();
  const refreshSubscription = useSubscriptionStore((s) => s.refresh);
  const protocols = useProtocolStore((s) => s.protocols);
  const protocolsLoading = useProtocolStore((s) => s.loading);
  const didSkipInitialProtocolSync = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile(session.user.id);
      void initPurchases(session.user.id).then(() => refreshSubscription());
    }
  }, [session?.user?.id]);

  useEffect(() => {
    // Don't redirect until we know auth state
    if (loading) return;

    const inAuth = segments[0] === '(auth)';

    if (!session) {
      if (!inAuth) router.replace('/(auth)/welcome');
      return;
    }

    // Onboarding gates removed for beta — route all authed users straight to tabs
    if (inAuth) {
      router.replace('/(tabs)');
    }
  }, [loading, session, profile, segments]);

  useEffect(() => {
    didSkipInitialProtocolSync.current = false;
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id || protocolsLoading) return;

    if (!didSkipInitialProtocolSync.current) {
      didSkipInitialProtocolSync.current = true;
      return;
    }

    void scheduleDoseReminders(protocols);
  }, [protocols, protocolsLoading, session?.user?.id]);

  return (
    <>
      <OfflineBanner />
      <ErrorBoundary>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="log/sleep" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="log/water" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="log/workout" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="providers/index" options={{ headerShown: false }} />
          <Stack.Screen name="providers/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="paywall" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        </Stack>
      </ErrorBoundary>
    </>
  );
}
