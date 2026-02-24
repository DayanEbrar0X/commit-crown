/* ----------------------------------------------------------------
   GitHub API helpers
   Uses the public contributions API (no auth required)
   ---------------------------------------------------------------- */

import type { ContributionYear, ContributionDay } from "./types";

const CONTRIBUTIONS_API =
  "https://github-contributions-api.jogruber.de/v4";

/**
 * Fetch contribution data for a GitHub user for a given year.
 * Returns null if the request fails.
 */
export async function fetchContributions(
  username: string,
  year: number | "last" = "last"
): Promise<ContributionYear | null> {
  try {
    const res = await fetch(
      `${CONTRIBUTIONS_API}/${username}?y=${year}`,
      { next: { revalidate: 3600 } } // cache for 1 hour
    );
    if (!res.ok) return null;

    const data = await res.json();
    const yearData = data.contributions
      ? data
      : data[year] ?? data[Object.keys(data)[0]];

    if (!yearData?.contributions) return null;

    return {
      year: String(year),
      total: yearData.total?.lastYear ?? yearData.total ?? 0,
      range: yearData.range ?? { start: "", end: "" },
      contributions: yearData.contributions as ContributionDay[],
    };
  } catch {
    return null;
  }
}

/**
 * Organize flat contribution days into weekly columns (Sun-Sat).
 */
export function groupByWeek(
  contributions: ContributionDay[]
): ContributionDay[][] {
  const weeks: ContributionDay[][] = [];
  let currentWeek: ContributionDay[] = [];

  for (const day of contributions) {
    const date = new Date(day.date + "T00:00:00");
    const dow = date.getDay(); // 0 = Sun

    if (dow === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  return weeks;
}

/**
 * Calculate the current contribution streak (consecutive days).
 */
export function calculateStreak(contributions: ContributionDay[]): number {
  let streak = 0;
  // Walk backwards from most recent
  for (let i = contributions.length - 1; i >= 0; i--) {
    if (contributions[i].count > 0) {
      streak++;
    } else if (streak > 0) {
      break;
    }
  }
  return streak;
}

/**
 * Get month labels with their week index positions.
 */
export function getMonthLabels(
  weeks: ContributionDay[][]
): { label: string; weekIdx: number }[] {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const labels: { label: string; weekIdx: number }[] = [];
  let lastMonth = -1;

  for (let w = 0; w < weeks.length; w++) {
    const firstDay = weeks[w][0];
    if (!firstDay) continue;
    const month = new Date(firstDay.date + "T00:00:00").getMonth();
    if (month !== lastMonth) {
      // Ensure minimum spacing of 3 weeks
      if (labels.length === 0 || w - labels[labels.length - 1].weekIdx >= 3) {
        labels.push({ label: months[month], weekIdx: w });
        lastMonth = month;
      }
    }
  }

  return labels;
}
