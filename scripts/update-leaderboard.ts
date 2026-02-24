/**
 * update-leaderboard.ts
 *
 * Fetches contribution data from multiple sources and builds
 * a ranked leaderboard. Runs weekly via GitHub Actions.
 *
 * Sources:
 *  1. Manual list      — data/contributors.json (community PRs)
 *  2. committers.top   — public JSON of top committers by country
 *  3. GitHub Search API — discovers popular active developers
 *
 * Usage:
 *   npx tsx scripts/update-leaderboard.ts
 *   GITHUB_TOKEN=ghp_xxx npx tsx scripts/update-leaderboard.ts
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

/* ----------------------------------------------------------------
   TYPES
   ---------------------------------------------------------------- */

interface ContributionData {
  total: { lastYear?: number } | number;
  contributions: { date: string; count: number; level: number }[];
}

interface Contributor {
  username: string;
  avatarUrl: string;
  totalContributions: number;
  weeklyChange: number;
  currentStreak: number;
  source: "manual" | "committers.top" | "github-api";
  lastUpdated: string;
}

interface LeaderboardOutput {
  updatedAt: string;
  year: number;
  totalTracked: number;
  sources: string[];
  contributors: Contributor[];
}

/* ----------------------------------------------------------------
   CONTRIBUTIONS API (public, no auth needed)
   ---------------------------------------------------------------- */

const CONTRIBUTIONS_API = "https://github-contributions-api.jogruber.de/v4";

async function fetchContributions(
  username: string
): Promise<ContributionData | null> {
  try {
    const res = await fetch(`${CONTRIBUTIONS_API}/${username}?y=last`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function calculateStreak(contributions: { count: number }[]): number {
  let streak = 0;
  for (let i = contributions.length - 1; i >= 0; i--) {
    if (contributions[i].count > 0) streak++;
    else if (streak > 0) break;
  }
  return streak;
}

function getWeeklyContributions(
  contributions: { date: string; count: number }[]
): number {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);
  return contributions
    .filter((c) => new Date(c.date) >= weekAgo)
    .reduce((sum, c) => sum + c.count, 0);
}

/* ----------------------------------------------------------------
   SOURCE 1: MANUAL LIST (data/contributors.json)
   ---------------------------------------------------------------- */

function loadManualList(dataDir: string): string[] {
  try {
    const raw = readFileSync(join(dataDir, "contributors.json"), "utf-8");
    const data = JSON.parse(raw);
    return data.contributors ?? [];
  } catch {
    return [];
  }
}

/* ----------------------------------------------------------------
   SOURCE 2: COMMITTERS.TOP (public JSON, no auth)
   Top committers by country — we pull the top N from key regions.
   ---------------------------------------------------------------- */

interface CommittersTopData {
  [country: string]: {
    title: string;
    user: string[];
    data_asof: string;
  };
}

const TOP_COUNTRIES = [
  "united_states",
  "china",
  "india",
  "germany",
  "united_kingdom",
  "canada",
  "japan",
  "france",
  "brazil",
  "australia",
  "south_korea",
  "russia",
  "netherlands",
  "sweden",
  "switzerland",
  "israel",
  "singapore",
  "pakistan",
];

async function discoverFromCommittersTop(
  perCountry: number = 5
): Promise<string[]> {
  console.log("\n[committers.top] Fetching top committers by country...");
  try {
    const res = await fetch("https://committers.top/rank_only.json");
    if (!res.ok) {
      console.log("  Failed to fetch committers.top data");
      return [];
    }
    const data: CommittersTopData = await res.json();
    const usernames = new Set<string>();

    for (const country of TOP_COUNTRIES) {
      const entry = data[country];
      if (!entry?.user) continue;
      // Take top N from each country (they're pre-sorted by commits)
      const top = entry.user.slice(0, perCountry);
      top.forEach((u) => usernames.add(u));
      console.log(`  ${entry.title}: ${top.length} users`);
    }

    console.log(`  Total discovered: ${usernames.size} unique users`);
    return Array.from(usernames);
  } catch (e) {
    console.log("  Error fetching committers.top:", e);
    return [];
  }
}

/* ----------------------------------------------------------------
   SOURCE 3: GITHUB SEARCH API (needs GITHUB_TOKEN for rate limits)
   Discovers popular developers by follower count.
   ---------------------------------------------------------------- */

interface GitHubUser {
  login: string;
}

async function discoverFromGitHub(
  limit: number = 50
): Promise<string[]> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.log("\n[GitHub API] Skipped — no GITHUB_TOKEN set");
    return [];
  }

  console.log("\n[GitHub API] Discovering top developers...");
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const usernames: string[] = [];
  const perPage = Math.min(limit, 100);
  const pages = Math.ceil(limit / perPage);

  for (let page = 1; page <= pages; page++) {
    try {
      const res = await fetch(
        `https://api.github.com/search/users?q=type:user+followers:>1000&sort=followers&order=desc&per_page=${perPage}&page=${page}`,
        { headers }
      );
      if (!res.ok) {
        console.log(`  Page ${page} failed: ${res.status}`);
        break;
      }
      const data = await res.json();
      const items: GitHubUser[] = data.items ?? [];
      items.forEach((u) => usernames.push(u.login));
      console.log(`  Page ${page}: ${items.length} users`);

      // Respect rate limit
      await new Promise((r) => setTimeout(r, 1000));
    } catch (e) {
      console.log(`  Error on page ${page}:`, e);
      break;
    }
  }

  console.log(`  Total discovered: ${usernames.length} users`);
  return usernames;
}

/* ----------------------------------------------------------------
   MAIN: Merge all sources, fetch contributions, rank, save
   ---------------------------------------------------------------- */

async function main() {
  const dataDir = join(process.cwd(), "data");
  const activeSources: string[] = ["manual"];

  // 1. Load all sources
  const manualUsers = loadManualList(dataDir);
  console.log(`[Manual] ${manualUsers.length} users from contributors.json`);

  const committersTopUsers = await discoverFromCommittersTop(5);
  if (committersTopUsers.length > 0) activeSources.push("committers.top");

  const githubUsers = await discoverFromGitHub(50);
  if (githubUsers.length > 0) activeSources.push("github-api");

  // 2. Merge & deduplicate — manual users get priority
  const sourceMap = new Map<string, Contributor["source"]>();
  manualUsers.forEach((u) => sourceMap.set(u.toLowerCase(), "manual"));
  committersTopUsers.forEach((u) => {
    if (!sourceMap.has(u.toLowerCase())) sourceMap.set(u.toLowerCase(), "committers.top");
  });
  githubUsers.forEach((u) => {
    if (!sourceMap.has(u.toLowerCase())) sourceMap.set(u.toLowerCase(), "github-api");
  });

  // Keep original casing — build a case map
  const caseMap = new Map<string, string>();
  [...manualUsers, ...committersTopUsers, ...githubUsers].forEach((u) => {
    if (!caseMap.has(u.toLowerCase())) caseMap.set(u.toLowerCase(), u);
  });

  const allUsernames = Array.from(sourceMap.keys()).map(
    (lower) => caseMap.get(lower) ?? lower
  );

  console.log(`\n[Merged] ${allUsernames.length} unique users to process`);

  // 3. Load previous leaderboard for weekly change
  let previousData: Contributor[] = [];
  try {
    const prev = readFileSync(join(dataDir, "leaderboard.json"), "utf-8");
    previousData = JSON.parse(prev).contributors ?? [];
  } catch {
    /* first run */
  }
  const prevMap = new Map(previousData.map((c) => [c.username.toLowerCase(), c]));

  // 4. Fetch contribution data for everyone
  const results: Contributor[] = [];
  let fetched = 0;

  for (const username of allUsernames) {
    fetched++;
    const progress = `[${fetched}/${allUsernames.length}]`;
    process.stdout.write(`  ${progress} ${username}...`);

    const data = await fetchContributions(username);
    if (!data) {
      console.log(" skipped");
      continue;
    }

    const total =
      typeof data.total === "number"
        ? data.total
        : data.total?.lastYear ?? 0;

    // Skip users with 0 contributions (inactive/invalid)
    if (total === 0) {
      console.log(" 0 contributions, skipped");
      continue;
    }

    const streak = calculateStreak(data.contributions);
    const weekly = getWeeklyContributions(data.contributions);

    const prev = prevMap.get(username.toLowerCase());
    const weeklyChange = prev ? total - prev.totalContributions : weekly;

    results.push({
      username,
      avatarUrl: `https://github.com/${username}.png?size=80`,
      totalContributions: total,
      weeklyChange: Math.max(0, weeklyChange),
      currentStreak: streak,
      source: sourceMap.get(username.toLowerCase()) ?? "manual",
      lastUpdated: new Date().toISOString(),
    });

    console.log(` ${total.toLocaleString()} commits`);

    // Rate limiting
    await new Promise((r) => setTimeout(r, 300));
  }

  // 5. Sort by total contributions descending
  results.sort((a, b) => b.totalContributions - a.totalContributions);

  // 6. Write leaderboard
  const leaderboard: LeaderboardOutput = {
    updatedAt: new Date().toISOString(),
    year: new Date().getFullYear(),
    totalTracked: results.length,
    sources: activeSources,
    contributors: results,
  };

  writeFileSync(
    join(dataDir, "leaderboard.json"),
    JSON.stringify(leaderboard, null, 2) + "\n"
  );

  // 7. Summary
  console.log("\n" + "=".repeat(50));
  console.log(`Leaderboard updated: ${results.length} contributors`);
  console.log(`Sources: ${activeSources.join(", ")}`);
  console.log(
    `Top 5:\n${results
      .slice(0, 5)
      .map((c, i) => `  ${i + 1}. ${c.username} — ${c.totalContributions.toLocaleString()} (${c.source})`)
      .join("\n")}`
  );
  console.log("=".repeat(50));
}

main().catch(console.error);
