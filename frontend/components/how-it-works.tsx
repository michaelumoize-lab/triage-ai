"use client";

import { Users, Stethoscope, Brain, CheckCircle } from "lucide-react";

interface StepProps {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function Step({ number, icon, title, description }: StepProps) {
  return (
    <div className="flex gap-6">
      {/* Step number and connector */}
      <div className="flex flex-col items-center">
        <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mb-2">
          {number}
        </div>
        {number < 4 && (
          <div className="w-1 h-12 bg-gradient-to-b from-primary to-primary/20" />
        )}
      </div>

      {/* Content */}
      <div className="pb-12 flex-1">
        <div className="flex items-start gap-3 mb-3">
          <div className="h-6 w-6 text-primary flex-shrink-0 mt-1">{icon}</div>
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        </div>
        <p className="text-foreground/70 leading-relaxed max-w-md">
          {description}
        </p>
      </div>
    </div>
  );
}

export function HowItWorks() {
  const steps = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Select Patient & Symptoms",
      description:
        "Pick from your patient roster and select relevant symptoms from a comprehensive, clinically-organized list of 132 symptoms.",
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI Analysis",
      description:
        "The Random Forest model instantly analyzes symptom patterns against 4,961 training cases and 41 disease profiles.",
    },
    {
      icon: <Stethoscope className="h-6 w-6" />,
      title: "Get Diagnosis & Triage",
      description:
        "Receive primary diagnosis, differential diagnoses with confidence scores, red flags, and recommended specialist.",
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Record & Feedback",
      description:
        "Save the consultation, enter actual diagnosis, and provide feedback. Your data helps retrain and improve the model.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <div className="mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Four Steps to Better Decisions
          </h2>
          <p className="text-lg text-foreground/70">
            A streamlined workflow designed for speed and clinical accuracy.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {steps.map((step, idx) => (
            <Step
              key={idx}
              number={idx + 1}
              icon={step.icon}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 p-8 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-foreground mb-4">
            Each diagnosis comes with explainability: see which symptoms
            contributed most, identify red flags instantly, and get confidence
            scores for every prediction.
          </p>
          <p className="text-sm text-foreground/60">
            All powered by a transparent, auditable Random Forest model—not a
            black box.
          </p>
        </div>
      </div>
    </section>
  );
}
