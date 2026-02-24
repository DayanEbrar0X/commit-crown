"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState, useCallback } from "react";
import { formatNumber } from "@/lib/utils";

/* ----------------------------------------------------------------
   ANIMATED COUNTER
   ---------------------------------------------------------------- */

function AnimatedNumber({
  target,
  delay = 0,
}: {
  target: number;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState("0");

  const animate = useCallback(() => {
    const duration = 1200;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(formatNumber(Math.round(target * eased)));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [target]);

  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(animate, delay * 1000);
    return () => clearTimeout(timer);
  }, [inView, animate, delay]);

  return <span ref={ref}>{display}</span>;
}

/* ----------------------------------------------------------------
   STATS BAR
   ---------------------------------------------------------------- */

interface StatsBarProps {
  totalContributors: number;
  totalCommits: number;
  updatedAt: string;
}

export function StatsBar({
  totalContributors,
  totalCommits,
  updatedAt,
}: StatsBarProps) {
  const formatted = updatedAt
    ? new Date(updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Loading...";

  const stats = [
    { label: "Contributors", value: totalContributors },
    { label: "Total Commits", value: totalCommits },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="bg-background-secondary border-b border-border"
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
        {stats.map((stat, i) => (
          <div key={stat.label} className="flex items-center gap-2 text-sm">
            <span className="font-mono font-bold text-foreground">
              <AnimatedNumber target={stat.value} delay={0.1 * i} />
            </span>
            <span className="text-foreground-muted">{stat.label}</span>
          </div>
        ))}

        <div className="hidden sm:block w-px h-4 bg-border" />

        <div className="flex items-center gap-1.5 text-xs text-foreground-subtle">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Updated {formatted}
        </div>
      </div>
    </motion.div>
  );
}
