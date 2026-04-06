"use client";

import Link from "next/link";

type SectionId = "hero" | "tech" | "flow";

function NavAnchor({
  href,
  isActive,
  children,
}: {
  href: string;
  isActive: boolean;
  children: string;
}) {
  return (
    <a
      href={href}
      className="font-mono text-[13px] uppercase tracking-wide text-app-muted transition-colors hover:text-primary-container"
    >
      <span className={isActive ? "text-secondary-container" : "text-app-muted"}>
        {isActive ? "[.]" : "[ ]"}
      </span>{" "}
      {children}
    </a>
  );
}

export function LandingNav({
  active,
  githubUrl,
  theme,
  onToggleTheme,
}: {
  active: SectionId;
  githubUrl: string;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}) {
  return (
    <header className="fixed top-0 z-50 w-full bg-surface/90 backdrop-blur-sm transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-mono text-lg font-semibold lowercase tracking-tight text-primary-container"
        >
          atlas
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
          <NavAnchor href="#the-tech" isActive={active !== "flow"}>
            the tech
          </NavAnchor>
          <NavAnchor href="#the-flow" isActive={active === "flow"}>
            the flow
          </NavAnchor>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[13px] uppercase text-app-muted transition-colors hover:text-primary-container"
          >
            github
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            className="ghost-border px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-wide text-primary-container transition-colors hover:bg-surface-container-high sm:px-4 sm:text-xs"
            aria-label="Toggle color mode"
          >
            {theme === "dark" ? "> LIGHT_MODE" : "> DARK_MODE"}
          </button>
          <Link
            href="/dashboard"
            className="bg-primary-container px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-on-primary-fixed transition-opacity hover:opacity-90 sm:px-5 sm:text-xs"
          >
            GET_STARTED
          </Link>
        </div>
      </div>
    </header>
  );
}
