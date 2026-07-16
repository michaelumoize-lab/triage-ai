"use client";

import Link from "next/link";
import { ArrowRight, Brain } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-32 px-4 sm:px-6 lg:px-8">
      {/* Background gradient accent */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
          <Brain className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            AI-Powered Clinical Intelligence
          </span>
        </div>

        {/* Main headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
          Instant Diagnosis,{" "}
          <span className="text-primary">Accurate Triage</span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl text-foreground/70 mb-8 max-w-2xl leading-relaxed">
          TriageAI delivers real-time differential diagnoses and triage
          prioritization. Support clinical decision-making with AI that&apos;s
          trained on 41 diseases across 132 symptoms.
        </p>

        {/* Stats/Key numbers */}
        <div className="grid grid-cols-3 gap-6 mb-12 py-8 border-y border-border">
          <div>
            <div className="text-3xl font-bold text-primary mb-1">41</div>
            <div className="text-sm text-foreground/60">
              Diseases Recognized
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-1">132</div>
            <div className="text-sm text-foreground/60">Symptoms Mapped</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-1">100%</div>
            <div className="text-sm text-foreground/60">Test Accuracy</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex items-center justify-center px-8 py-4 border border-border rounded-lg font-semibold text-foreground hover:bg-muted transition-colors"
          >
            See How It Works
          </Link>
        </div>

        {/* Trust indicator */}
        <p className="text-sm text-foreground/50 mt-8">
          Built for healthcare professionals. HIPAA-ready. Deployed on Vercel.
        </p>
      </div>
    </section>
  );
}
