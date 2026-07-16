"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 p-12 text-center overflow-hidden">
          {/* Background accent */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ready to Transform Clinical Decision-Making?
          </h2>
          <p className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto">
            Start using TriageAI today. No credit card required. Your first
            consultation is on us.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="mailto:contact@triageai.com"
              className="inline-flex items-center justify-center px-8 py-4 border border-primary rounded-lg font-semibold text-primary hover:bg-primary/5 transition-colors"
            >
              Schedule Demo
            </Link>
          </div>

          <p className="text-sm text-foreground/60 mt-8">
            Join healthcare professionals making smarter clinical decisions.
          </p>
        </div>
      </div>
    </section>
  );
}
