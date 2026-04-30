import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { session, setSession, setLoading } = useAuthStore();
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
    const inAuth = segments[0] === '(auth)';
    if (!session) {
      if (!inAuth || segments[1] !== 'welcome') router.replace('/(auth)/welcome');
      return;
    }
    if (profile !== null && !profile.disclaimer_accepted) {
      if (!inAuth || segments[1] !== 'disclaimer') router.replace('/(auth)/disclaimer');
      return;
    }
    if (profile?.disclaimer_accepted && inAuth) {
      router.replace('/(tabs)/');
    }
  }, [session, profile?.disclaimer_accepted, segments]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
