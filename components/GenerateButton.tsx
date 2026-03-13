"use client";

type Props = {
  loading: boolean;
  onGenerate: () => void;
};

export default function GenerateButton({ loading, onGenerate }: Props) {
  return (
    <button
      onClick={onGenerate}
      disabled={loading}
      className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
    >
      {loading ? "Generating..." : "Generate Post"}
    </button>
  );
}