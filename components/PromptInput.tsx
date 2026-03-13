"use client";

type Props = {
  prompt: string;
  setPrompt: (value: string) => void;
};

export default function PromptInput({ prompt, setPrompt }: Props) {
  return (
    <textarea
      className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
      rows={5}
      placeholder="Enter your LinkedIn post prompt..."
      value={prompt}
      onChange={(e) => setPrompt(e.target.value)}
    />
  );
}