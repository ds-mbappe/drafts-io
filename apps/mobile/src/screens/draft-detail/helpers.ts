// ── Helpers ────────────────────────────────────────────────────────────────────

export const TOPIC_PALETTE = [
  { bg: 'rgba(0,111,238,0.12)', text: '#006FEE' },
  { bg: 'rgba(249,115,22,0.12)', text: '#EA580C' },
  { bg: 'rgba(168,85,247,0.12)', text: '#9333EA' },
  { bg: 'rgba(34,197,94,0.12)', text: '#16A34A' },
  { bg: 'rgba(236,72,153,0.12)', text: '#DB2777' },
  { bg: 'rgba(6,182,212,0.12)', text: '#0891B2' },
];

export function topicColor(topic: string) {
  let h = 0;
  for (let i = 0; i < topic.length; i++) h = topic.charCodeAt(i) + ((h << 5) - h);
  return TOPIC_PALETTE[Math.abs(h) % TOPIC_PALETTE.length];
}

export function relativeTime(dateStr: string): string {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d`;
  const mo = Math.floor(d / 30);
  return mo < 12 ? `${mo}mo` : `${Math.floor(mo / 12)}y`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}
