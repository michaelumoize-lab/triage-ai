"use client";

import { Clock, BarChart3, AlertCircle, GitBranch } from "lucide-react";

interface BenefitProps {
  icon: React.ReactNode;
  metric: string;
  description: string;
}

function BenefitCard({ icon, metric, description }: BenefitProps) {
  return (
    <div className="p-8 rounded-lg border border-border bg-card">
      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <div className="text-2xl font-bold text-primary mb-2">{metric}</div>
      <p className="text-foreground/70 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export function Benefits() {
  const benefits = [
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      metric: "<2 seconds",
      description:
        "Get diagnosis and triage level in less than 2 seconds. Immediate decision support.",
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-primary" />,
      metric: "41 Diseases",
      description:
        "Covers 41 conditions across all major medical specialties and departments.",
    },
    {
      icon: <AlertCircle className="h-6 w-6 text-primary" />,
      metric: "Red Flag Detection",
      description:
        "Automatic identification of critical symptoms requiring immediate attention.",
    },
    {
      icon: <GitBranch className="h-6 w-6 text-primary" />,
      metric: "Continuous Learning",
      description:
        "Every diagnosis and feedback loops back to improve future predictions.",
    },
  ];

  return (
    <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Why Healthcare Teams Choose TriageAI
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl">
            Purpose-built for the demands of modern clinical practice.
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {benefits.map((benefit, idx) => (
            <BenefitCard
              key={idx}
              icon={benefit.icon}
              metric={benefit.metric}
              description={benefit.description}
            />
          ))}
        </div>

        {/* Trust section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-border">
          <div>
            <h3 className="font-semibold text-foreground mb-2">
              Clinically Validated
            </h3>
            <p className="text-sm text-foreground/70">
              Trained on real-world patient data with rigorous validation
              protocols.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">
              Privacy First
            </h3>
            <p className="text-sm text-foreground/70">
              HIPAA-compliant. All patient data encrypted. Deployed on secure
              enterprise infrastructure.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">
              Always Improving
            </h3>
            <p className="text-sm text-foreground/70">
              Regular model updates based on feedback. You&apos;re part of making
              healthcare smarter.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
