"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthState } from "@/app/actions/auth";
import { AuthFormWrapper } from "@/components/auth/AuthFormWrapper";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    loginAction,
    null,
  );

  return (
    <AuthFormWrapper>
      {/* System label */}
      <p className="mb-2 font-mono text-xs uppercase tracking-widest text-secondary-container">
        // AUTHENTICATE
      </p>

      {/* Heading */}
      <h1 className="mb-8 font-mono text-2xl font-bold lowercase tracking-tight text-app-text sm:text-3xl">
        access your brain
      </h1>

      {/* Error display */}
      {state?.error && (
        <div className="mb-6 border-l-2 border-red-500 bg-surface-container-lowest px-4 py-3">
          <p className="font-mono text-xs text-red-400">
            [ERROR] {state.error}
          </p>
        </div>
      )}

      {/* Form */}
      <form action={formAction} className="flex flex-col gap-5">
        {/* Email field */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="login-email"
            className="font-mono text-[11px] uppercase tracking-wider text-app-muted"
          >
            &gt; EMAIL_ADDRESS
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="operator@atlas.sys"
            disabled={isPending}
            className="w-full border-b border-outline-variant bg-surface-container-low px-4 py-3 font-mono text-sm text-app-text placeholder:text-app-muted/40 focus:border-primary-container focus:outline-none disabled:opacity-50"
          />
        </div>

        {/* Password field */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="login-password"
            className="font-mono text-[11px] uppercase tracking-wider text-app-muted"
          >
            &gt; PASSWORD
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            disabled={isPending}
            className="w-full border-b border-outline-variant bg-surface-container-low px-4 py-3 font-mono text-sm text-app-text placeholder:text-app-muted/40 focus:border-primary-container focus:outline-none disabled:opacity-50"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isPending}
          className="glow-primary mt-2 flex h-12 w-full items-center justify-center bg-primary-container font-mono text-sm font-bold uppercase tracking-wide text-on-primary-fixed transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "AUTHENTICATING..." : "[ LOGIN ]"}
        </button>
      </form>

      {/* Footer link */}
      <p className="mt-8 text-center font-mono text-xs text-app-muted">
        no account?{" "}
        <Link
          href="/signup"
          className="text-primary-container transition-colors hover:text-primary-container/80"
        >
          &gt; CREATE_ACCOUNT
        </Link>
      </p>
    </AuthFormWrapper>
  );
}
