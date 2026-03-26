import TopNav from '@/components/TopNav';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import PipelineSection from '@/components/PipelineSection';
import FooterSection from '@/components/FooterSection';

export default function Home() {
  return (
    <main className="w-full bg-background">
      <TopNav />
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PipelineSection />
      <FooterSection />
    </main>
  );
}
