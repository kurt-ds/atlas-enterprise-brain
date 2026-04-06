"use client";

import { Heart } from "lucide-react";

export function LandingFooter({ githubUrl }: { githubUrl: string }) {
  return (
    <footer className="bg-surface px-6 py-10 transition-colors duration-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 text-center text-xs text-app-muted sm:flex-row sm:items-center sm:justify-between sm:text-left sm:text-[13px]">
        <p className="font-mono">© 2026 ATLAS_SYSTEMS // SOVEREIGN_ARCHITECT</p>
        <p className="flex items-center justify-center gap-1.5 text-secondary-container">
          <span>made with</span>
          <Heart
            className="size-3.5 fill-secondary-container text-secondary-container"
            aria-hidden
          />
          <span>and late-night vibes by kurt-ds</span>
        </p>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 font-mono sm:justify-end">
          <a
            href="https://twitter.com"
            className="text-app-muted transition-colors hover:text-primary-container"
            target="_blank"
            rel="noopener noreferrer"
          >
            _TWITTER
          </a>
          <a
            href={githubUrl}
            className="text-app-muted transition-colors hover:text-primary-container"
            target="_blank"
            rel="noopener noreferrer"
          >
            GITHUB
          </a>
          <a
            href="https://linkedin.com"
            className="text-app-muted transition-colors hover:text-primary-container"
            target="_blank"
            rel="noopener noreferrer"
          >
            LINKEDIN
          </a>
          <a
            href="https://discord.com"
            className="text-app-muted transition-colors hover:text-primary-container"
            target="_blank"
            rel="noopener noreferrer"
          >
            DISCORD
          </a>
        </div>
      </div>
    </footer>
  );
}
