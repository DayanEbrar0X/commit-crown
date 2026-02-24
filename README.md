# Commit Crown

The weekly GitHub commit leaderboard. Ship code, earn your crown.

A clean, minimal, open-source dashboard that tracks the most active GitHub contributors. Built with Next.js, Tailwind CSS, and Framer Motion.

## How it works

- **Live data**: Contribution heatmaps are fetched in real-time from GitHub's public API
- **Weekly updates**: A GitHub Actions cron job runs every Monday to update the leaderboard rankings
- **Anyone can join**: Add your GitHub username via pull request and you're on the board

## Join the leaderboard

1. **Fork** this repository
2. **Add** your GitHub username to `data/contributors.json`
3. **Open** a pull request

That's it. Once merged, your profile will appear on the leaderboard with live contribution data.

## Tech stack

- [Next.js 16](https://nextjs.org) with App Router
- [Tailwind CSS v4](https://tailwindcss.com)
- [Framer Motion](https://motion.dev) for animations
- [GitHub Contributions API](https://github-contributions-api.jogruber.de) for live data
- GitHub Actions for weekly automated updates

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Manually update the leaderboard
npx tsx scripts/update-leaderboard.ts
```

## Project structure

```
commit-crown/
├── .github/workflows/     # GitHub Actions (weekly leaderboard update)
├── data/
│   ├── contributors.json  # Tracked usernames (add yourself here!)
│   └── leaderboard.json   # Auto-generated rankings
├── scripts/
│   └── update-leaderboard.ts  # Fetches data & ranks contributors
├── src/
│   ├── app/               # Next.js App Router pages
│   ├── components/        # React components
│   └── lib/               # API helpers, types, utilities
└── README.md
```

## Contributing

Contributions are welcome. Whether it's adding yourself to the leaderboard, improving the UI, or fixing bugs — open a PR.

## License

MIT
