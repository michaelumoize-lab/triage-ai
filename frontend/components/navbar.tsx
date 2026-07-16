"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { Logo } from "./logo";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";

export function Navbar() {
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const hasMounted = useRef(false);
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      setMounted(true);
    }
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Logo className="h-8 w-8" />
            <span className="font-bold text-xl text-foreground">TriageAI</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#benefits"
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              Benefits
            </Link>
          </div>

          {/* Theme Switcher & CTA */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {mounted &&
                (theme === "dark" ? (
                  <Sun className="h-5 w-5 text-foreground" />
                ) : (
                  <Moon className="h-5 w-5 text-foreground" />
                ))}
            </button>
            <Link
              href="/sign-in"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
