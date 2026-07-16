import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { HowItWorks } from "@/components/how-it-works";
import { Benefits } from "@/components/benefits";
import { CTASection } from "@/components/cta-section";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "TriageAI - Clinical Decision Support Platform",
  description:
    "Instant diagnosis and triage using AI-powered clinical intelligence. Support faster patient assessments with 41 diseases, 132 symptoms, and real-time predictions.",
  openGraph: {
    title: "TriageAI - Clinical Decision Support Platform",
    description:
      "AI-powered triage and differential diagnosis for healthcare professionals.",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Benefits />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
