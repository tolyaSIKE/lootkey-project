import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import GameGrid from "../components/GameGrid";

export default function HomePage() {
  return (
    <main className="bg-gray-950 min-h-screen p-4">
      <Navbar />
      <Hero />
      <GameGrid />
    </main>
  );
}