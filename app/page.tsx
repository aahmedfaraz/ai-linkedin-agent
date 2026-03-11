"use client";

import { useState } from "react";

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const [post, setPost] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!prompt) return;

    setLoading(true);
    setError("");
    setPost("");

    try {
      const res = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setPost(data.post);
      }
    } catch (err) {
      setError("Network error: " + err);
    }

    setLoading(false);
  };

  const handleConnectLinkedIn = () => {
    alert("Connect LinkedIn functionality placeholder");
  };

  const handlePublish = () => {
    alert("Publish to LinkedIn functionality placeholder");
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <header className="max-w-2xl w-full text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">AI LinkedIn Post Agent</h1>
        <p className="text-gray-600 mb-4">
          Generate and preview LinkedIn posts using AI.
        </p>
        <button
          onClick={handleConnectLinkedIn}
          className="bg-gray-800 text-white font-semibold py-2 px-4 rounded hover:bg-gray-700"
        >
          Connect LinkedIn
        </button>
      </header>

      <main className="max-w-2xl w-full flex flex-col gap-4">
        <textarea
          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
          rows={5}
          placeholder="Enter your LinkedIn post prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Post"}
        </button>

        {error && <p className="text-red-500">{error}</p>}

        {post && (
          <div className="border rounded p-4 bg-gray-50">
            <h2 className="font-semibold mb-2">Preview:</h2>
            <p className="whitespace-pre-line">{post}</p>

            <button
              onClick={handlePublish}
              className="mt-4 bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded"
            >
              Publish to LinkedIn
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

// end