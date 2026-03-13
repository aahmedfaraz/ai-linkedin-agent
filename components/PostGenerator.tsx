"use client";

import { useState } from "react";
import PromptInput from "@/components/PromptInput";
import GenerateButton from "@/components/GenerateButton";
import PostPreview from "@/components/PostPreview";

export default function PostGenerator() {
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
        headers: {
          "Content-Type": "application/json",
        },
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

  const handlePublish = () => {
    alert("Publish to LinkedIn functionality placeholder");
  };

  return (
    <div className="w-full space-y-4">
      <PromptInput prompt={prompt} setPrompt={setPrompt} />

      <GenerateButton loading={loading} onGenerate={handleGenerate} />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <PostPreview post={post} onPublish={handlePublish} />
    </div>
  );
}