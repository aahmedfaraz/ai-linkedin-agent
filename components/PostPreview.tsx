"use client";

type Props = {
  post: string;
  onPublish: () => void;
};

export default function PostPreview({ post, onPublish }: Props) {
  if (!post) return null;

  return (
    <div className="border rounded p-4 bg-gray-50">
      <h2 className="font-semibold mb-2">Preview:</h2>
      <p className="whitespace-pre-line">{post}</p>

      <button
        onClick={onPublish}
        className="mt-4 bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded"
      >
        Publish to LinkedIn
      </button>
    </div>
  );
}