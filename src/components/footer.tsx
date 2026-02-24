export function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-foreground-subtle font-mono">
        <div className="flex items-center gap-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="text-gold"
          >
            <path d="M2 15h16V8l-4 3.5L10 4l-4 7.5L2 8v7z" />
            <rect x="2" y="15" width="16" height="2" rx="0.5" opacity="0.6" />
          </svg>
          Commit Crown
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/DayanEbrar0X/commit-crown"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
          <span className="text-border">|</span>
          <span>
            Built by{" "}
            <a
              href="https://github.com/DayanEbrar0X"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-dark hover:text-gold transition-colors"
            >
              DayanEbrar0X
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
