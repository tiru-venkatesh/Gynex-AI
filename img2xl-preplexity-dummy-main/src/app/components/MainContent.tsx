import React, { useState } from "react";
import { ArrowRight, Paperclip } from "lucide-react";
import { uploadPDF } from "../../api/upload";

interface Props {
  onSearch: (q: string) => void;
}

export function MainContent({ onSearch }: Props) {
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);

  // Submit text question
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    onSearch(input);
    setInput("");
  };

  // Upload PDF
  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      await uploadPDF(file);

      // Auto summarize after upload
      onSearch("Summarize this document");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={submit} className="p-6 space-y-2">

      {/* Textarea */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Upload PDF or ask anything..."
        className="w-full p-3 border rounded outline-none"
        rows={3}
        disabled={uploading}
      />

      {/* Actions */}
      <div className="flex items-center gap-2">

        {/* Hidden file input */}
        <input
          type="file"
          hidden
          id="fileUpload"
          accept="application/pdf"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleUpload(e.target.files[0]);
            }
          }}
        />

        {/* Upload icon */}
        <label
          htmlFor="fileUpload"
          className={`cursor-pointer ${
            uploading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <Paperclip />
        </label>

        {/* Send button */}
        <button
          type="submit"
          disabled={!input.trim() || uploading}
          className="disabled:opacity-50"
        >
          <ArrowRight />
        </button>

        {/* Upload status */}
        {uploading && (
          <span className="text-sm text-gray-500">
            Uploading...
          </span>
        )}

      </div>
    </form>
  );
}
