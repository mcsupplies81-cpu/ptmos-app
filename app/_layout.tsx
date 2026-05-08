import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { initPurchases } from '@/lib/purchases';
import { requestNotificationPermission } from '@/utils/notifications';
import OfflineBanner from '@/components/OfflineBanner';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { session, loading, setSession, setLoading } = useAuthStore();
  const { profile, fetchProfile } = useProfileStore();
  const refreshSubscription = useSubscriptionStore((s) => s.refresh);

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
    void requestNotificationPermission();
  }, []);

  return (
    <>
      <OfflineBanner />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="log/sleep" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="log/water" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="log/workout" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="paywall" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
    </>
  );
}
