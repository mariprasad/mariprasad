import Hero from "@/components/sections/Hero";
import Intro from "@/components/sections/Intro";
import BakerySection from "@/components/sections/BakerySection";
import WorkSection from "@/components/sections/WorkSection";
import CricketSection from "@/components/sections/CricketSection";
import MovementSection from "@/components/sections/MovementSection";
import MapSection from "@/components/sections/MapSection";
import NowWatchingSection from "@/components/sections/NowWatchingSection";
import { getRecentFilms } from "@/lib/letterboxd";

export default async function Home() {
  const films = await getRecentFilms();
  return (
    <>
      <Hero />
      <Intro />
      <BakerySection />
      <WorkSection />
      <CricketSection />
      <MovementSection />
      <MapSection />
      <NowWatchingSection films={films} />
    </>
  );
}
