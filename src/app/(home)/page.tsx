import AboutSection from "@/components/About";
import ContestSection from "@/components/Contest";
import CountdownTimer from "@/components/CountDown";
import HeroSection from "@/components/Hero";
import Contests from "@/components/Other";
import UniversitiesSection from "@/components/Universities";


export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CountdownTimer />
      <AboutSection />
      <UniversitiesSection />
      <ContestSection />
      <Contests />
    </>
  )
}