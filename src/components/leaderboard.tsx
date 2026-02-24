"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrophyBadge } from "./trophy-badge";
import { ContributionHeatmap } from "./contribution-heatmap";
import { formatNumber, cn } from "@/lib/utils";
import type { Contributor } from "@/lib/types";

/* ----------------------------------------------------------------
   FILTER CONFIG
   ---------------------------------------------------------------- */

const FILTERS = [
  { label: "All", min: 0, max: Infinity },
  { label: "50K+", min: 50_000, max: Infinity },
  { label: "20K+", min: 20_000, max: Infinity },
  { label: "10K+", min: 10_000, max: Infinity },
  { label: "Under 10K", min: 0, max: 9_999 },
] as const;

/* ----------------------------------------------------------------
   CONTRIBUTOR ROW
   ---------------------------------------------------------------- */

interface RowProps {
  contributor: Contributor;
  rank: number;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

function ContributorRow({
  contributor,
  rank,
  index,
  isExpanded,
  onToggle,
}: RowProps) {
  const isTop3 = rank <= 3;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: 0.3,
        delay: Math.min(index * 0.02, 0.6),
        ease: [0.25, 0.4, 0.25, 1],
      }}
    >
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 text-left transition-all duration-200",
          "hover:bg-card-hover",
          isTop3 && "bg-gold-50/30",
          isExpanded && "bg-gold-50/50"
        )}
      >
        {/* Rank */}
        <TrophyBadge rank={rank} delay={Math.min(index * 0.03, 0.5)} />

        {/* Avatar */}
        <img
          src={contributor.avatarUrl}
          alt={contributor.username}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-border"
          loading="lazy"
        />

        {/* Name & source */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground truncate">
              {contributor.username}
            </span>
            {contributor.source && contributor.source !== "manual" && (
              <span className="hidden sm:inline-flex px-1.5 py-0.5 text-[9px] font-mono rounded bg-gold-50 text-gold-dark border border-gold-200">
                {contributor.source}
              </span>
            )}
          </div>
          <div className="text-xs text-foreground-subtle font-mono">
            {contributor.currentStreak > 0 &&
              `${contributor.currentStreak}d streak`}
          </div>
        </div>

        {/* Weekly change */}
        {contributor.weeklyChange > 0 && (
          <div className="hidden sm:flex items-center gap-1 text-xs font-mono text-green-600">
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="currentColor"
            >
              <path d="M5 1L9 6H1L5 1z" />
            </svg>
            +{formatNumber(contributor.weeklyChange)}
          </div>
        )}

        {/* Total commits */}
        <div className="text-right">
          <div
            className={cn(
              "text-lg sm:text-xl font-bold font-mono",
              isTop3 ? "text-gold-dark" : "text-foreground"
            )}
          >
            {formatNumber(contributor.totalContributions)}
          </div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-foreground-subtle">
            commits
          </div>
        </div>

        {/* Expand indicator */}
        <motion.svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-foreground-subtle flex-shrink-0"
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path d="M4 6l4 4 4-4" />
        </motion.svg>
      </button>

      {/* Expanded heatmap */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-border-light"
          >
            <div className="p-4 sm:p-6 bg-background-secondary">
              <ContributionHeatmap username={contributor.username} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ----------------------------------------------------------------
   SEARCH + FILTER BAR
   ---------------------------------------------------------------- */

function SearchFilterBar({
  search,
  onSearchChange,
  activeFilter,
  onFilterChange,
  resultCount,
  totalCount,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  activeFilter: number;
  onFilterChange: (i: number) => void;
  resultCount: number;
  totalCount: number;
}) {
  return (
    <div className="sticky top-0 z-20 bg-white border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 space-y-3">
        {/* Search */}
        <div className="relative">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle"
          >
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5L14 14" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search contributors..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-background-secondary border border-border rounded-lg placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-subtle hover:text-foreground"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M3 3l8 8M11 3l-8 8" />
              </svg>
            </button>
          )}
        </div>

        {/* Filters + count */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {FILTERS.map((filter, i) => (
              <button
                key={filter.label}
                onClick={() => onFilterChange(i)}
                className={cn(
                  "px-3 py-1.5 text-xs font-mono rounded-md whitespace-nowrap transition-all duration-200",
                  activeFilter === i
                    ? "bg-gold text-white shadow-sm"
                    : "bg-background-secondary text-foreground-muted hover:bg-gold-50 hover:text-gold-dark border border-border"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <span className="text-xs font-mono text-foreground-subtle whitespace-nowrap">
            {resultCount === totalCount
              ? `${totalCount} total`
              : `${resultCount} / ${totalCount}`}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   STATS BAR
   ---------------------------------------------------------------- */

function StatsBar({
  count,
  totalCommits,
  updatedAt,
}: {
  count: number;
  totalCommits: number;
  updatedAt: string;
}) {
  const formatted = updatedAt
    ? new Date(updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div className="bg-background-secondary border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-mono font-bold text-foreground">{count}</span>
          <span className="text-foreground-muted">Contributors</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-mono font-bold text-foreground">
            {formatNumber(totalCommits)}
          </span>
          <span className="text-foreground-muted">Total Commits</span>
        </div>
        <div className="hidden sm:block w-px h-4 bg-border" />
        <div className="flex items-center gap-1.5 text-xs text-foreground-subtle">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Updated {formatted}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   LEADERBOARD
   ---------------------------------------------------------------- */

interface LeaderboardProps {
  contributors: Contributor[];
  updatedAt: string;
}

export function Leaderboard({ contributors, updatedAt }: LeaderboardProps) {
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(0);

  const totalCommits = useMemo(
    () => contributors.reduce((sum, c) => sum + c.totalContributions, 0),
    [contributors]
  );

  // Apply search + filter
  const filtered = useMemo(() => {
    const filter = FILTERS[activeFilter];
    const q = search.toLowerCase().trim();

    return contributors.filter((c) => {
      // Search match
      if (q && !c.username.toLowerCase().includes(q)) return false;
      // Range filter
      if (c.totalContributions < filter.min) return false;
      if (c.totalContributions > filter.max) return false;
      return true;
    });
  }, [contributors, search, activeFilter]);

  return (
    <div>
      {/* Stats */}
      <StatsBar
        count={contributors.length}
        totalCommits={totalCommits}
        updatedAt={updatedAt}
      />

      {/* Search + Filters */}
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        resultCount={filtered.length}
        totalCount={contributors.length}
      />

      {/* Table */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto">
          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <div className="text-foreground-subtle text-sm font-mono">
                No contributors match your search
              </div>
              <button
                onClick={() => {
                  setSearch("");
                  setActiveFilter(0);
                }}
                className="mt-3 text-xs text-gold-dark hover:underline font-mono"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="divide-y divide-border">
                {filtered.map((contributor, index) => (
                  <ContributorRow
                    key={contributor.username}
                    contributor={contributor}
                    rank={index + 1}
                    index={index}
                    isExpanded={expandedUser === contributor.username}
                    onToggle={() =>
                      setExpandedUser(
                        expandedUser === contributor.username
                          ? null
                          : contributor.username
                      )
                    }
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
