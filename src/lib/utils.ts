/* ----------------------------------------------------------------
   Utility helpers
   ---------------------------------------------------------------- */

/**
 * Merge class names (simple version, no clsx dependency).
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Format a number with commas: 12345 -> "12,345"
 */
export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

/**
 * Relative time string: "2 days ago", "just now", etc.
 */
export function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;

  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
