import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/stores/auth.store';
import { api } from '@/src/lib/api';

WebBrowser.maybeCompleteAuthSession();

type Provider = 'google' | 'github' | 'facebook';

const CLIENT_IDS: Record<Provider, string> = {
  google: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '',
  github: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID ?? '',
  facebook: process.env.EXPO_PUBLIC_FACEBOOK_CLIENT_ID ?? '',
};

const SCOPES: Record<Provider, string> = {
  google: 'openid profile email',
  github: 'read:user user:email',
  facebook: 'public_profile,email',
};

function getGoogleRedirectUri(): string {
  const clientId = CLIENT_IDS.google;
  // iOS OAuth clients use the reversed client ID as the redirect URI scheme
  const reversed = clientId.split('.').reverse().join('.');
  return `${reversed}:/oauth2redirect/google`;
}

function buildAuthUrl(provider: Provider, redirectUri: string): string {
  const clientId = CLIENT_IDS[provider];
  const scope = SCOPES[provider];
  const params = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, scope, response_type: 'code' });

  if (provider === 'google') {
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }
  if (provider === 'github') {
    return `https://github.com/login/oauth/authorize?${params}`;
  }
  return `https://www.facebook.com/v18.0/dialog/oauth?${params}`;
}

export function useSocialAuth(provider: Provider) {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  const signIn = async () => {
    const redirectUri = provider === 'google'
      ? getGoogleRedirectUri()
      : Linking.createURL('auth/callback');
    const authUrl = buildAuthUrl(provider, redirectUri);

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
    if (result.type !== 'success') return;

    const codeMatch = result.url.match(/[?&]code=([^&]+)/);
    const code = codeMatch ? decodeURIComponent(codeMatch[1]) : null;
if (!code) return;

    const { data } = await api.post('/auth/social', { provider, code, redirectUri });
    await setSession(data.user, data.access_token, data.refresh_token);
    router.replace('/(secure)/(tabs)/');
  };

  return { signIn };
}
