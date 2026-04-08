"use client";

import { useEffect, useState, type ReactNode } from "react";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";

const GITHUB_URL = "https://github.com/kurt-ds/atlas-enterprise-brain";

export function AuthFormWrapper({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const root = document.documentElement;
    const savedTheme = window.localStorage.getItem("atlas-theme");
    const systemIsLight = window.matchMedia(
      "(prefers-color-scheme: light)",
    ).matches;
    const initialTheme =
      savedTheme === "light" || savedTheme === "dark"
        ? (savedTheme as "light" | "dark")
        : systemIsLight
          ? "light"
          : "dark";

    setTheme(initialTheme);
    root.classList.toggle("light", initialTheme === "light");
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("theme-transition");
    root.classList.toggle("light", theme === "light");
    window.localStorage.setItem("atlas-theme", theme);

    const timeout = window.setTimeout(() => {
      root.classList.remove("theme-transition");
    }, 280);

    return () => {
      window.clearTimeout(timeout);
      root.classList.remove("theme-transition");
    };
  }, [theme]);

  return (
    <div className="flex min-h-screen flex-col bg-surface text-app-text transition-colors duration-300 selection:bg-primary-container/30 selection:text-app-text">
      <LandingNav
        active="hero"
        githubUrl={GITHUB_URL}
        theme={theme}
        onToggleTheme={() =>
          setTheme((current) => (current === "dark" ? "light" : "dark"))
        }
        showSectionNav={false}
      />

      <main className="grid-paper flex flex-1 items-center justify-center px-6 pb-20 pt-28">
        <div className="w-full max-w-md">
          <div className="ghost-border relative bg-surface-container-high px-8 py-10 sm:px-10 sm:py-12">
            {/* Corner brackets decoration */}
            <span className="pointer-events-none absolute left-0 top-0 size-4 border-l-2 border-t-2 border-primary-container" />
            <span className="pointer-events-none absolute right-0 top-0 size-4 border-r-2 border-t-2 border-primary-container" />
            <span className="pointer-events-none absolute bottom-0 left-0 size-4 border-b-2 border-l-2 border-primary-container" />
            <span className="pointer-events-none absolute bottom-0 right-0 size-4 border-b-2 border-r-2 border-primary-container" />

            {children}
          </div>
        </div>
      </main>

      <LandingFooter githubUrl={GITHUB_URL} />
    </div>
  );
}
