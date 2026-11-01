import TopNav from '@/components/TopNav';
import HeroSection from '@/components/HeroSection';
import BuiltForBar from '@/components/BuiltForBar';
import BottleneckSection from '@/components/BottleneckSection';
import FeaturesSection from '@/components/FeaturesSection';
import DifferenceSection from '@/components/DifferenceSection';
import PipelineSection from '@/components/PipelineSection';
import FounderSection from '@/components/FounderSection';
import FoundingProgramSection from '@/components/FoundingProgramSection';
import PricingSection from '@/components/PricingSection';
import FooterSection from '@/components/FooterSection';

export default function Home() {
  return (
    <main className="landing-page w-full bg-background text-foreground">
      <TopNav />
      <HeroSection />
      <BuiltForBar />
      <BottleneckSection />
      <FeaturesSection />
      <DifferenceSection />
      <PipelineSection />
      <FounderSection />
      <FoundingProgramSection />
      {/* <PricingSection /> */}
      <FooterSection />
    </main>
  );
}
