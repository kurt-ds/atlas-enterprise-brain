"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Boxes, Database, FileText, Sparkles } from "lucide-react";
import { LandingFooter } from "./LandingFooter";
import { LandingNav } from "./LandingNav";

const GITHUB_URL = "https://github.com/kurt-ds/atlas-enterprise-brain";

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

type SectionId = "hero" | "tech" | "flow";

function useActiveSection() {
  const [active, setActive] = useState<SectionId>("hero");

  useEffect(() => {
    const nodes = [
      { id: "hero" as const, el: document.getElementById("hero") },
      { id: "tech" as const, el: document.getElementById("the-tech") },
      { id: "flow" as const, el: document.getElementById("the-flow") },
    ].filter((n): n is { id: SectionId; el: HTMLElement } => Boolean(n.el));

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const id = e.target.id;
          if (id === "hero") setActive("hero");
          else if (id === "the-tech") setActive("tech");
          else if (id === "the-flow") setActive("flow");
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    for (const n of nodes) obs.observe(n.el);
    return () => obs.disconnect();
  }, []);

  return active;
}

const techItems = [
  { icon: Boxes, label: "NEXT.JS 16" },
  { icon: Database, label: "SUPABASE (PGVECTOR)" },
  { icon: Sparkles, label: "GROQ + LLAMA 3 + SCOUT" },
  { icon: FileText, label: "UNPDF PARSER" },
] as const;

const flowSteps = [
  {
    n: "01",
    tag: "INPUT",
    title: "pdf document",
    body: "Upload one or more PDFs; we preserve structure for faithful retrieval.",
    accent: "green" as const,
  },
  {
    n: "02",
    tag: "PARSE",
    title: "unpdf parser",
    body: "Extract text and layout so chunks stay aligned with the source page.",
    accent: "cyan" as const,
  },
  {
    n: "03",
    tag: "CHUNK",
    title: "split & window",
    body: "Semantic splits sized for context windows and cleaner embeddings.",
    accent: "green" as const,
  },
  {
    n: "04",
    tag: "EMBED",
    title: "transformers",
    body: "Vectorize passages so similarity search finds the right evidence.",
    accent: "cyan" as const,
  },
  {
    n: "05",
    tag: "STORE",
    title: "pgvector",
    body: "Persist vectors in Postgres with Supabase for durable knowledge.",
    accent: "green" as const,
  },
  {
    n: "06",
    tag: "QUERY",
    title: "groq + llm",
    body: "Ask in natural language; answers cite the spans we retrieved.",
    accent: "cyan" as const,
  },
];

export function LandingHome() {
  const active = useActiveSection();
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const root = document.documentElement;
    const savedTheme = window.localStorage.getItem("atlas-theme");
    const systemIsLight = window.matchMedia("(prefers-color-scheme: light)").matches;
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
    <div className="min-h-screen bg-surface text-app-text transition-colors duration-300 selection:bg-primary-container/30 selection:text-app-text">
      <LandingNav
        active={active}
        githubUrl={GITHUB_URL}
        theme={theme}
        onToggleTheme={() =>
          setTheme((current) => (current === "dark" ? "light" : "dark"))
        }
      />

      <main>
        <section
          id="hero"
          className="grid-paper scroll-mt-24 px-6 pb-24 pt-32 sm:pb-28"
        >
          <div className="mx-auto max-w-6xl">
            <div className="max-w-4xl pl-0 md:pl-20">
              <p className="mb-6 font-mono text-xs uppercase tracking-widest text-secondary-container">
              // PROJECT_ATLAS_INITIAL_COMMIT
              </p>
              <h1 className="mb-8 font-mono text-4xl font-bold lowercase leading-[1.02] tracking-tight text-app-text sm:text-6xl">
              stop command-f&apos;ing your pdfs.
              </h1>
              <p className="mb-12 max-w-2xl text-lg leading-relaxed text-app-muted">
              Upload PDFs, ask questions in plain language, and get answers with
              citations back to the document. Built for teams who live in specs,
              reports, and long-form knowledge—not search boxes.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/dashboard"
                  className="inline-flex h-12 items-center justify-center bg-primary-container px-8 font-mono text-sm font-bold uppercase tracking-wide text-on-primary-fixed transition-opacity hover:opacity-90"
                >
                  [ TRY THE DEMO ]
                </Link>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ghost-border inline-flex h-12 items-center justify-center gap-2 px-8 font-mono text-sm font-medium uppercase text-primary-container transition-colors hover:bg-surface-container-high"
                >
                  <GitHubMark className="size-4 opacity-90" />
                  VIEW ON GITHUB
                </a>
              </div>
            </div>
          </div>
        </section>

        <section
          id="the-tech"
          className="scroll-mt-24 bg-surface-container-low px-6 py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="pl-0 md:pl-20">
              <h2 className="mb-12 font-mono text-3xl font-bold lowercase tracking-tight text-app-text sm:text-4xl">
              peeking under the hood
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
              {techItems.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="ghost-border flex items-center gap-4 bg-surface-container-high px-7 py-7 transition-colors hover:bg-surface-bright"
                >
                  <Icon
                    className="size-6 shrink-0 text-primary-container"
                    strokeWidth={1.5}
                  />
                  <span className="font-mono text-sm text-app-text sm:text-base">
                    {label}
                  </span>
                </div>
              ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="the-flow"
          className="scroll-mt-24 bg-surface px-6 py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="pl-0 md:pl-20">
              <h2 className="mb-14 font-mono text-3xl font-bold lowercase tracking-tight text-app-text sm:text-4xl">
              the flow
              </h2>
              <div className="relative pl-4 sm:pl-6">
              <div
                className="absolute bottom-0 left-[1.15rem] top-0 w-px bg-secondary-container/50 sm:left-[1.35rem]"
                aria-hidden
              />
              <ul className="relative space-y-10 sm:space-y-12">
                {flowSteps.map((step) => {
                  const border =
                    step.accent === "green"
                      ? "border-secondary-container/70"
                      : "border-primary-container/70";
                  const tagColor =
                    step.accent === "green"
                      ? "text-secondary-container"
                      : "text-primary-container";
                  return (
                    <li key={step.n} className="flex gap-5 sm:gap-8">
                      <div
                        className={`relative z-[1] flex size-11 shrink-0 items-center justify-center border bg-surface-container-lowest font-mono text-xs font-semibold text-app-text sm:size-12 sm:text-sm ${border}`}
                      >
                        {step.n}
                      </div>
                      <div className="ghost-border min-w-0 flex-1 bg-surface-container-high px-7 py-7">
                        <p className={`mb-2 font-mono text-xs ${tagColor}`}>
                          [ {step.tag} ]
                        </p>
                        <h3 className="mb-2 font-mono text-lg font-semibold lowercase text-app-text">
                          {step.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-app-muted sm:text-base">
                          {step.body}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              </div>
              <p className="mt-14 text-right font-mono text-[11px] leading-relaxed text-app-muted sm:text-xs">
                // LOGIC FLOW UTILIZES ASYNC/SYNC RETRIEVAL TO MINIMIZE LATENCY
                AND MAXIMIZE PRECISION.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-low px-6 py-20">
          <div className="mx-auto max-w-6xl pl-0 md:pl-20">
            <div className="ghost-border relative max-w-3xl bg-surface-container-high px-8 py-12 sm:px-12 sm:py-16">
              <span className="pointer-events-none absolute left-0 top-0 size-5 border-l-2 border-t-2 border-primary-container" />
              <span className="pointer-events-none absolute right-0 top-0 size-5 border-r-2 border-t-2 border-primary-container" />
              <span className="pointer-events-none absolute bottom-0 left-0 size-5 border-b-2 border-l-2 border-primary-container" />
              <span className="pointer-events-none absolute bottom-0 right-0 size-5 border-b-2 border-r-2 border-primary-container" />
              <h2 className="mb-8 font-mono text-2xl font-semibold lowercase text-app-text sm:text-3xl">
                Ready to query?
              </h2>
              <div className="flex justify-start">
                <Link
                  href="/dashboard"
                  className="glow-primary inline-flex h-14 min-w-[240px] items-center justify-center bg-primary-container px-10 font-mono text-sm font-bold uppercase tracking-wide text-on-primary-fixed transition-opacity hover:opacity-90"
                >
                  START_NEW_SESSION
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter githubUrl={GITHUB_URL} />
    </div>
  );
}
