import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';
import { initRevenueCat } from '@/lib/revenueCat';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { session, loading, setSession, setLoading } = useAuthStore();
  const user = useAuthStore((state) => state.session?.user);
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
    initRevenueCat(user?.id);
  }, [user?.id]);

  useEffect(() => {
    // Don't redirect until we know auth state
    if (loading) return;

    const inAuth = segments[0] === '(auth)';

    if (!session) {
      if (!inAuth) router.replace('/(auth)/welcome');
      return;
    }

    if (profile === undefined) return; // still fetching profile

    if (profile !== null && !profile.disclaimer_accepted) {
      if (!inAuth || segments[1] !== 'disclaimer') router.replace('/(auth)/disclaimer');
      return;
    }

    if (profile?.disclaimer_accepted && inAuth) {
      router.replace('/(tabs)/');
    }
  }, [loading, session, profile, segments]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
