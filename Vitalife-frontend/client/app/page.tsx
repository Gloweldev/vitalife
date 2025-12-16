import { Hero } from '@/components/home/Hero';
import { IdentitySection } from '@/components/home/IdentitySection';
import { SupportSection } from '@/components/home/SupportSection';
import { ProductShowcase } from '@/components/home/ProductShowcase';
import { LeadMagnet } from '@/components/home/LeadMagnet';

export default function Home() {
  return (
    <main>
      <Hero />
      <IdentitySection />
      <SupportSection />
      <ProductShowcase />
      <LeadMagnet />
    </main>
  );
}
