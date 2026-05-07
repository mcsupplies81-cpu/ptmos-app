import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '@/lib/supabase';

// Required for iOS to properly close the browser after OAuth
WebBrowser.maybeCompleteAuthSession();

const redirectTo = makeRedirectUri({
  scheme: 'ptmos',
  path: 'auth-callback',
});

/**
 * Sign in with a Supabase OAuth provider.
 * Works in both Expo Go (exp:// scheme) and production (ptmos:// scheme).
 *
 * Prerequisites in Supabase Dashboard:
 *  - Authentication > Providers > Google: enabled, add your Client ID/Secret
 *  - Authentication > Providers > Apple: enabled (needs Apple Developer setup)
 *  - Authentication > URL Configuration > Redirect URLs: add  `ptmos://auth-callback`
 *    and for Expo Go: `exp://127.0.0.1:8081/--/auth-callback`
 */
export async function signInWithProvider(provider: 'google' | 'apple'): Promise<string | null> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    return error?.message ?? 'Could not initiate OAuth flow';
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type === 'cancel' || result.type === 'dismiss') {
    return null; // user cancelled — not an error
  }

  if (result.type !== 'success') {
    return 'Authentication failed';
  }

  // Tokens come back in the URL fragment: #access_token=...&refresh_token=...
  const fragment = result.url.includes('#') ? result.url.split('#')[1] : '';
  const params = new URLSearchParams(fragment);

  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');

  if (!accessToken) {
    return 'No token received. Please try again.';
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken ?? '',
  });

  return sessionError?.message ?? null;
}
