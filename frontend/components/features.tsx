"use client";

import { Zap, Shield, TrendingUp, Users, Workflow, Lock } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-6 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors group">
      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-foreground/70 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export function Features() {
  const features = [
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "Real-Time Predictions",
      description:
        "Get instant differential diagnoses based on patient symptoms. No waiting for results.",
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Clinical Validation",
      description:
        "Trained on 4,961 real patient cases with 100% accuracy on test data.",
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-primary" />,
      title: "Triage Intelligence",
      description:
        "Automatic triage level assignment: Immediate, Emergency, Urgent, Semi-Urgent, or Non-Urgent.",
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Patient Management",
      description:
        "Keep complete patient histories, track consultations, and manage medical records securely.",
    },
    {
      icon: <Workflow className="h-6 w-6 text-primary" />,
      title: "Specialist Routing",
      description:
        "Get recommended specialists based on diagnosis. Route patients efficiently across departments.",
    },
    {
      icon: <Lock className="h-6 w-6 text-primary" />,
      title: "Enterprise Security",
      description:
        "HIPAA-compliant architecture. All data encrypted. Perfect for clinical environments.",
    },
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Clinical Precision, Delivered
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl">
            TriageAI combines machine learning with clinical best practices to
            support faster, more confident patient assessments.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <FeatureCard
              key={idx}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
