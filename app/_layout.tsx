import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';
import { requestNotificationPermission } from '@/utils/notifications';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { session, loading, setSession, setLoading } = useAuthStore();
  const { profile, fetchProfile } = useProfileStore();

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
    if (session?.user?.id) fetchProfile(session.user.id);
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

  return <Stack screenOptions={{ headerShown: false }} />;
}
