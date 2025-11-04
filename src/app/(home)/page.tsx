import AboutSection from "@/components/About";
import ContestSection from "@/components/Contest";
import HeroSection from "@/components/Hero";
import Contests from "@/components/Other";
import { TimerProvider, useTimer } from "@/context/CountdownContext";

export default async function HomePage() {

  return (
    <>
        <HeroSection />
        {/* <CountdownTimer /> */}
        <AboutSection />
        {/* <UniversitiesSection /> */}
        <ContestSection />
        <Contests />
    </>
  );
}
