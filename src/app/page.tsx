import Hero from "@/components/sections/Hero";
import Intro from "@/components/sections/Intro";
import BakerySection from "@/components/sections/BakerySection";
import WorkSection from "@/components/sections/WorkSection";
import CricketSection from "@/components/sections/CricketSection";
import MovementSection from "@/components/sections/MovementSection";
import MapSection from "@/components/sections/MapSection";
import NowWatchingSection from "@/components/sections/NowWatchingSection";

export default function Home() {
  return (
    <>
      <Hero />
      <Intro />
      <BakerySection />
      <WorkSection />
      <CricketSection />
      <MovementSection />
      <MapSection />
      <NowWatchingSection films={[]} />
    </>
  );
}
