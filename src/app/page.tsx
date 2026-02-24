import { Header } from "@/components/header";
import { Leaderboard } from "@/components/leaderboard";
import { JoinCTA } from "@/components/join-cta";
import { Footer } from "@/components/footer";
import leaderboardData from "../../data/leaderboard.json";
import type { Contributor } from "@/lib/types";

export default function HomePage() {
  const contributors = (leaderboardData.contributors ?? []) as Contributor[];

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Leaderboard
        contributors={contributors}
        updatedAt={leaderboardData.updatedAt}
      />
      <JoinCTA />
      <Footer />
    </main>
  );
}
