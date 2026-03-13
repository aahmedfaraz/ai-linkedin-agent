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
  const [prompt, setPrompt] = useState("");
  const [post, setPost] = useState("");
  const [loading, setLoading] = useState(false);
  const [generateError, setGenerateError] = useState("");

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

  const handleGenerate = async () => {
    if (!prompt) return;

    setLoading(true);
    setGenerateError("");
    setPost("");

    try {
      const res = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGenerateError(data.error || "Something went wrong");
      } else {
        setPost(data.post ?? "");
      }
    } catch (err) {
      setGenerateError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = () => {
    // Placeholder – wire to /api/publish-post when ready
    alert("Publish to LinkedIn functionality placeholder");
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
            AI LinkedIn Post Agent
          </h1>
          <p className="text-sm text-neutral-500">
            Connect LinkedIn and generate posts using AI. The agent handles the rest.
          </p>
          <div className="pt-2">
            {connected === null ? (
              <div className="h-10 w-40 rounded-lg bg-neutral-200 animate-pulse mx-auto" />
            ) : connected ? (
              <div className="inline-flex items-center gap-2 text-emerald-600 text-sm font-medium">
                <span>✓</span>
                <span>LinkedIn connected</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleConnect}
                className="h-10 px-5 rounded-lg bg-[#0A66C2] text-white text-sm font-medium hover:bg-[#004182] transition-colors"
              >
                Connect LinkedIn
              </button>
            )}
          </div>
        </header>

        {errorMessage && (
          <div
            role="alert"
            className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          >
            {errorMessage}
          </div>
        )}

        <main className="flex flex-col gap-4">
          <textarea
            className="w-full p-3 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent"
            rows={5}
            placeholder="e.g. Write a LinkedIn post about AI transforming startups..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="h-11 px-5 rounded-lg bg-neutral-800 text-white text-sm font-medium hover:bg-neutral-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Generating..." : "Generate Post"}
          </button>

          {generateError && (
            <p className="text-sm text-red-600">{generateError}</p>
          )}

          {post && (
            <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
              <h2 className="text-sm font-semibold text-neutral-700">Preview</h2>
              <p className="text-neutral-800 whitespace-pre-line">{post}</p>
              <button
                type="button"
                onClick={handlePublish}
                className="h-10 px-5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-500 transition-colors"
              >
                Publish to LinkedIn
              </button>
            </div>
          )}
        </main>
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
