"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import type { ChatMessage } from "@/lib/types/chat";

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
  const [loading, setLoading] = useState(false);
  const [generateError, setGenerateError] = useState("");

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [instruction, setInstruction] = useState("");
  const [finalDraft, setFinalDraft] = useState<string>(""); // last draft
  const chatEndRef = useRef<HTMLDivElement>(null);

  const errorCode = searchParams.get("error");
  const errorMessage =
    errorCode && ERROR_MESSAGES[errorCode]
      ? ERROR_MESSAGES[errorCode]
      : errorCode
        ? "Something went wrong. Try again."
        : null;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check LinkedIn connection
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
    setMessages([]);
    setInstruction("");

    const newMessages: ChatMessage[] = [{ role: "user", content: prompt }];

    try {
      const res = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGenerateError(data.error || "Something went wrong");
      } else {
        setMessages([
          ...newMessages,
          { role: "assistant", content: data.post ?? "" },
        ]);
        setFinalDraft(data.post ?? ""); // ✅ Save as latest draft
      }
    } catch {
      setGenerateError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImprove = async () => {
    if (!instruction || messages.length === 0) return;

    setLoading(true);

    const updatedMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: instruction },
    ];

    try {
      const res = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGenerateError(data.error || "Something went wrong");
        return;
      }

      setMessages([
        ...updatedMessages,
        { role: "assistant", content: data.post ?? "" },
      ]);
      setFinalDraft(data.post ?? ""); // ✅ Save as latest draft
      setInstruction("");
    } catch {
      setGenerateError("Network error");
    } finally {
      setLoading(false);
    }
  };

  /** On send: detect intent (publish vs improve). If publish, call publish API; else improve. */
  const handleSendInstruction = async () => {
    if (!instruction.trim() || messages.length === 0) return;

    setLoading(true);
    setGenerateError("");

    try {
      const intentRes = await fetch("/api/chat-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: instruction.trim() }),
      });
      const intentData = await intentRes.json();
      const intent = intentRes.ok && intentData.intent === "publish" ? "publish" : "improve";

      if (intent === "publish") {
        setMessages((m) => [...m, { role: "user", content: instruction.trim() }]);
        setInstruction("");

        const res = await fetch("/api/publish-post", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: finalDraft }),
        });
        const data = await res.json();

        if (!res.ok) {
          setMessages((m) => [
            ...m,
            { role: "assistant", content: `Failed to publish: ${data.error || "Unknown error"}` },
          ]);
        } else {
          setMessages((m) => [
            ...m,
            { role: "assistant", content: "I've published your post to LinkedIn." },
          ]);
          alert("Posted to LinkedIn 🎉");
        }
      } else {
        await handleImprove();
      }
    } catch {
      setGenerateError("Network error");
      setMessages((m) => [
        ...m,
        { role: "user", content: instruction },
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
      setInstruction("");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!finalDraft) return; // make sure a draft exists

    try {
      const res = await fetch("/api/publish-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: finalDraft }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to publish post");
        return;
      }

      alert("Posted to LinkedIn 🎉");
    } catch {
      alert("Network error while publishing");
    }
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

          {/* Chat-based post preview */}
          {messages.length > 0 && (
            <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
              <h2 className="text-sm font-semibold text-neutral-700">Post Chat History</h2>

              <div className="space-y-3 max-h-96 overflow-y-auto p-2 border border-neutral-100 rounded-lg bg-gray-50">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`inline-block p-3 rounded-lg max-w-[80%] break-words whitespace-pre-wrap ${
                        msg.role === "user" ? "bg-blue-200 text-black" : "bg-gray-100 text-neutral-800"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <textarea
                  className="w-full p-2 border border-neutral-200 rounded-lg"
                  rows={2}
                  placeholder="Ask to improve the post, or say e.g. “looks good, publish it” to post to LinkedIn"
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                />
              <button
                onClick={handleSendInstruction}
                disabled={loading}
                className="h-10 px-4 rounded-lg bg-neutral-700 text-white text-sm hover:bg-neutral-600 disabled:opacity-50"
              >
                Send
              </button>
              </div>
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