"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  fetchContributions,
  groupByWeek,
  getMonthLabels,
} from "@/lib/github";
import type { ContributionDay } from "@/lib/types";

/* ----------------------------------------------------------------
   HEATMAP SQUARE
   ---------------------------------------------------------------- */

const LEVEL_CLASSES: Record<number, string> = {
  0: "bg-heat-0",
  1: "bg-heat-1",
  2: "bg-heat-2",
  3: "bg-heat-3",
  4: "bg-heat-4",
};

function Square({
  day,
  index,
  animate,
}: {
  day: ContributionDay;
  index: number;
  animate: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="relative"
      initial={animate ? { opacity: 0, scale: 0.5 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.15,
        delay: animate ? Math.min(index * 0.0008, 1.5) : 0,
      }}
    >
      <div
        className={`w-2.5 h-2.5 rounded-sm ${LEVEL_CLASSES[day.level] ?? LEVEL_CLASSES[0]} transition-transform hover:scale-150 cursor-pointer`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      {hovered && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-white text-[10px] font-mono rounded whitespace-nowrap z-20 pointer-events-none">
          {day.count} contribution{day.count !== 1 ? "s" : ""} on{" "}
          {new Date(day.date + "T00:00:00").toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </div>
      )}
    </motion.div>
  );
}

/* ----------------------------------------------------------------
   HEATMAP SKELETON
   ---------------------------------------------------------------- */

function HeatmapSkeleton() {
  return (
    <div className="animate-pulse space-y-1">
      {Array.from({ length: 7 }).map((_, r) => (
        <div key={r} className="flex gap-0.5">
          {Array.from({ length: 52 }).map((_, c) => (
            <div key={c} className="w-2.5 h-2.5 rounded-sm bg-heat-0" />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------
   CONTRIBUTION HEATMAP
   ---------------------------------------------------------------- */

interface ContributionHeatmapProps {
  username: string;
  className?: string;
}

export function ContributionHeatmap({
  username,
  className = "",
}: ContributionHeatmapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [contributions, setContributions] = useState<ContributionDay[] | null>(
    null
  );
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!inView) return;

    fetchContributions(username, "last").then((data) => {
      if (data) {
        setContributions(data.contributions);
        setTotal(data.total);
      }
      setLoading(false);
    });
  }, [username, inView]);

  const weeks = useMemo(
    () => (contributions ? groupByWeek(contributions) : []),
    [contributions]
  );
  const monthLabels = useMemo(() => getMonthLabels(weeks), [weeks]);

  const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

  return (
    <div
      ref={ref}
      className={`bg-white rounded-xl border border-border p-5 overflow-x-auto ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <img
            src={`https://github.com/${username}.png?size=32`}
            alt={username}
            className="w-5 h-5 rounded-full"
          />
          <span className="text-xs font-mono text-foreground-muted">
            @{username}
          </span>
        </div>
        <span className="text-xs font-mono text-foreground-subtle">
          {total.toLocaleString()} contributions
        </span>
      </div>

      {loading ? (
        <HeatmapSkeleton />
      ) : (
        <div className="inline-block">
          {/* Month labels */}
          <div className="flex ml-8 mb-1">
            {monthLabels.map((m) => (
              <div
                key={`${m.label}-${m.weekIdx}`}
                className="text-[10px] font-mono text-foreground-subtle"
                style={{
                  position: "relative",
                  left: `${m.weekIdx * 12}px`,
                  width: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {m.label}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1">
              {DAY_LABELS.map((label, i) => (
                <div
                  key={i}
                  className="h-2.5 flex items-center text-[9px] font-mono text-foreground-subtle leading-none"
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {Array.from({ length: 7 }).map((_, di) => {
                  const day = week[di];
                  if (!day) {
                    return <div key={di} className="w-2.5 h-2.5" />;
                  }
                  return (
                    <Square
                      key={day.date}
                      day={day}
                      index={wi * 7 + di}
                      animate={true}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-1 mt-3">
            <span className="text-[9px] font-mono text-foreground-subtle mr-1">
              Less
            </span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`w-2.5 h-2.5 rounded-sm ${LEVEL_CLASSES[level]}`}
              />
            ))}
            <span className="text-[9px] font-mono text-foreground-subtle ml-1">
              More
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
