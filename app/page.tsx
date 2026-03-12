"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const ERROR_MESSAGES: Record<string, string> = {
  linkedin_not_configured:
    "LinkedIn app credentials are not set. Add LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET to .env.",
  invalid_scope_error:
    "Your LinkedIn app doesn't have the right permissions. In the LinkedIn Developer Portal, open your app → Products → add \"Share on LinkedIn\". Wait for it to move to \"Added products\" (can take a few minutes), then try again.",
  access_denied: "You declined the LinkedIn connection.",
  missing_code_or_config: "Connection failed. Missing code or server config.",
  token_exchange_failed: "Could not complete LinkedIn connection.",
  no_access_token: "LinkedIn did not return an access token.",
};

function HomeContent() {
  const searchParams = useSearchParams();
  const [connected, setConnected] = useState<boolean | null>(null);

  const errorCode = searchParams.get("error");
  const errorMessage =
    errorCode && ERROR_MESSAGES[errorCode]
      ? ERROR_MESSAGES[errorCode]
      : errorCode
        ? "Something went wrong. Try again."
        : null;

  useEffect(() => {
    fetch("/api/auth/status")
      .then((res) => res.json())
      .then((data) => setConnected(data.connected))
      .catch(() => setConnected(false));
  }, []);

  const handleConnect = () => {
    window.location.href = "/api/auth/linkedin";
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center space-y-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
            AI LinkedIn Post Agent
          </h1>
          <p className="text-sm text-neutral-500">
            Connect LinkedIn and post from here. The agent handles the rest.
          </p>
        </header>

        {errorMessage && (
          <div
            role="alert"
            className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          >
            {errorMessage}
          </div>
        )}

        <div className="flex flex-col items-center gap-4">
          {connected === null ? (
            <div className="h-11 w-48 rounded-lg bg-neutral-200 animate-pulse" />
          ) : connected ? (
            <div className="w-full space-y-4 rounded-xl border border-neutral-200 bg-white p-5 text-left">
              <div className="flex items-center gap-2 text-emerald-600">
                <span className="text-lg">✓</span>
                <span className="text-sm font-medium">LinkedIn connected</span>
              </div>
              <p className="text-sm text-neutral-500">
                You can post from this app. Use the post flow when we add it.
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleConnect}
              className="h-11 px-6 rounded-lg bg-[#0A66C2] text-white text-sm font-medium hover:bg-[#004182] transition-colors"
            >
              Connect LinkedIn
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="h-11 w-48 rounded-lg bg-neutral-200 animate-pulse" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
