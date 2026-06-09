import Hero from "@/components/sections/Hero";
import Intro from "@/components/sections/Intro";
import BakerySection from "@/components/sections/BakerySection";
import WorkSection from "@/components/sections/WorkSection";
import CricketSection from "@/components/sections/CricketSection";
import MovementSection from "@/components/sections/MovementSection";

export default function Home() {
  return (
    <>
      <Hero />
      <Intro />
      <BakerySection />
      <WorkSection />
      <CricketSection />
      <MovementSection />
    </>
  );
}
