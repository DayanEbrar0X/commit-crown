"use client";

import { motion } from "framer-motion";

/* ----------------------------------------------------------------
   Trophy badge for top 3 positions
   ---------------------------------------------------------------- */

const TROPHY_CONFIG: Record<
  number,
  { icon: string; color: string; bg: string; glow: string }
> = {
  1: {
    icon: "crown",
    color: "text-trophy-gold",
    bg: "bg-yellow-50",
    glow: "shadow-[0_0_12px_rgba(255,215,0,0.3)]",
  },
  2: {
    icon: "medal",
    color: "text-trophy-silver",
    bg: "bg-gray-50",
    glow: "shadow-[0_0_8px_rgba(192,192,192,0.3)]",
  },
  3: {
    icon: "medal",
    color: "text-trophy-bronze",
    bg: "bg-orange-50",
    glow: "shadow-[0_0_8px_rgba(205,127,50,0.3)]",
  },
};

function CrownSvg({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M2 15h16V8l-4 3.5L10 4l-4 7.5L2 8v7z" />
      <rect x="2" y="15" width="16" height="2" rx="0.5" opacity="0.6" />
    </svg>
  );
}

function MedalSvg({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <circle cx="10" cy="12" r="5" opacity="0.9" />
      <circle cx="10" cy="12" r="3" opacity="0.5" />
      <path d="M7 3l3 5 3-5H7z" opacity="0.6" />
    </svg>
  );
}

interface TrophyBadgeProps {
  rank: number;
  delay?: number;
}

export function TrophyBadge({ rank, delay = 0 }: TrophyBadgeProps) {
  const config = TROPHY_CONFIG[rank];
  if (!config) {
    return (
      <span className="w-8 text-center font-mono text-sm text-foreground-subtle">
        {rank}
      </span>
    );
  }

  const Icon = config.icon === "crown" ? CrownSvg : MedalSvg;

  return (
    <motion.div
      initial={{ scale: 0, rotate: -20 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 15,
        delay,
      }}
      className={`w-8 h-8 rounded-full ${config.bg} ${config.glow} flex items-center justify-center`}
    >
      <Icon className={config.color} />
    </motion.div>
  );
}
