/* ----------------------------------------------------------------
   Shared TypeScript types for Commit Crown
   ---------------------------------------------------------------- */

export type ContributorSource = "manual" | "committers.top" | "github-api";

export interface Contributor {
  username: string;
  avatarUrl: string;
  totalContributions: number;
  weeklyChange: number;
  currentStreak: number;
  source?: ContributorSource;
  lastUpdated: string;
}

export interface LeaderboardData {
  updatedAt: string;
  year: number;
  totalTracked: number;
  sources: string[];
  contributors: Contributor[];
}

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionWeek {
  days: ContributionDay[];
}

export interface ContributionYear {
  year: string;
  total: number;
  range: { start: string; end: string };
  contributions: ContributionDay[];
}
