import { useSegments, useRouter } from 'expo-router';

/**
 * Returns navigation helpers that push detail screens within the current tab's
 * own nested Stack, keeping the native tab bar visible.
 *
 * Works correctly from any depth inside a tab (tab root, drafts/[id], users/[username]).
 * segments[2] is always the tab folder name regardless of nesting depth.
 */
const TAB_ALIASES: Record<string, string> = { index: 'home' };

export function useTabRouter() {
  const segments = useSegments();
  const router = useRouter();
  const raw = (segments[2] as string) ?? 'home';
  const tab = TAB_ALIASES[raw] ?? raw;

  return {
    pushDraft: (id: string) =>
      router.push(`/(secure)/(tabs)/${tab}/drafts/${id}` as any),
    pushUser: (username: string) =>
      router.push(`/(secure)/(tabs)/${tab}/users/${username}` as any),
  };
}
