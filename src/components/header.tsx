"use client";

import { motion } from "framer-motion";

export function Header() {
  return (
    <header className="relative overflow-hidden border-b border-border bg-white">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(var(--gold) 1px, transparent 1px), linear-gradient(90deg, var(--gold) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 sm:py-20 text-center">
        {/* Crown icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
          className="inline-block mb-4"
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            className="text-gold"
          >
            <path
              d="M6 36h36V20l-9 8-9-16-9 16-9-8v16z"
              fill="currentColor"
              opacity="0.15"
            />
            <path
              d="M6 36h36V20l-9 8-9-16-9 16-9-8v16z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <rect
              x="6"
              y="36"
              width="36"
              height="4"
              rx="1"
              fill="currentColor"
              opacity="0.3"
            />
            <circle cx="15" cy="32" r="1.5" fill="currentColor" />
            <circle cx="24" cy="30" r="1.5" fill="currentColor" />
            <circle cx="33" cy="32" r="1.5" fill="currentColor" />
          </svg>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight"
        >
          Commit Crown
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-3 text-lg text-foreground-muted max-w-lg mx-auto"
        >
          The weekly GitHub commit leaderboard. Ship code, earn your crown.
        </motion.p>

        {/* Gold accent line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
          className="mx-auto mt-6 w-16 h-0.5 bg-gradient-to-r from-gold-light via-gold to-gold-dark rounded-full"
        />
      </div>
    </header>
  );
}
