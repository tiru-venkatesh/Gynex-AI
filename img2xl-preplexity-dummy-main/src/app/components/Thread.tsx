import React, { useState, useRef, useEffect } from "react";
import { askQuestion } from "../../api/ask";
import {
  ArrowRight,
  Layers,
  AlignLeft,
  Copy,
  Share,
  Globe,
  Image as ImageIcon,
  FileSpreadsheet,
  FileText,
  FileJson,
  Maximize2,
} from "lucide-react";

/* -------------------------------- Types -------------------------------- */

interface ThreadProps {
  query: string;
  onNewSearch: (query: string) => void;
}

interface SourceChunk {
  chunk_text: string;
}

/* ------------------------------- Component ------------------------------ */

export function Thread({ query, onNewSearch }: ThreadProps) {
  const [inputValue, setInputValue] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<SourceChunk[]>([]);
  const [ocrText, setOcrText] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  /* ---------------------------- Ask Question ---------------------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    try {
      setLoading(true);

      const res = await askQuestion(inputValue);

      setAnswer(res.answer || "No answer returned.");
      setSources(res.sources || []);
      setOcrText(res.ocr_text || "");


      onNewSearch(inputValue);
      setInputValue("");
    } catch (err) {
      console.error(err);
      setAnswer("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------- Auto Scroll ---------------------------- */

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [query, answer]);

  /* -------------------------------- Render ------------------------------ */

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f3f3ee] dark:bg-[#191a1a]">

      {/* ===================== Scrollable Content ===================== */}

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 pb-32 flex flex-col lg:flex-row gap-6">

          {/* ======================= Main Column ======================= */}

          <div className="flex-1 space-y-6">

            {/* Brand */}
            <div className="flex justify-center">
              <span className="text-lg font-bold text-gray-400 dark:text-gray-600">
                img2xl
              </span>
            </div>

            {/* Query */}
            <h1 className="text-3xl text-gray-900 dark:text-gray-100">
              {query}
            </h1>

            {/* Tabs */}
            <div className="flex gap-6 border-b text-sm">
              <div className="pb-2 border-b-2 border-emerald-500 text-emerald-600 flex items-center gap-2">
                <Layers size={16} /> Sources
              </div>

              <div className="pb-2 text-gray-500 flex items-center gap-2">
                <AlignLeft size={16} /> Answer
              </div>

              <div className="pb-2 text-gray-500 flex items-center gap-2">
                <Globe size={16} /> Related
              </div>
            </div>

            {/* ======================= Answer ======================= */}

            <div className="prose dark:prose-invert max-w-none">

              <p>
                {loading ? (
                  <span className="animate-pulse text-gray-400">
                    Thinking...
                  </span>
                ) : (
                  answer || "Ask something about your uploaded document."
                )}
              </p>

              {loading && (
                <p className="text-sm text-gray-400">
                  AI is analyzing your document...
                </p>
              )}

              {/* ======================= Sources ======================= */}

              {sources.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold mb-2">Sources</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {sources.map((s, i) => (
                      <div
                        key={i}
                        className="p-3 border rounded bg-white dark:bg-[#202222]"
                      >
                        <p className="text-xs text-gray-500">
                          Source #{i + 1}
                        </p>
                        <p className="text-sm line-clamp-4">
                          {s.chunk_text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {ocrText && (
  <div className="mt-6">
    <h3 className="text-sm font-semibold mb-2">
      OCR Raw Text
    </h3>

    <div className="p-3 bg-gray-100 dark:bg-[#202222] 
                    rounded-lg border text-xs 
                    whitespace-pre-wrap max-h-80 
                    overflow-y-auto">
      {ocrText}
    </div>
  </div>
)}


            {/* ======================= Related ======================= */}

            <div className="pt-4 border-t">
              <h3 className="flex items-center gap-2 mb-3">
                <Globe size={18} /> Related
              </h3>

              {[
                "How to verify OCR accuracy?",
                "Exporting tables to Quickbooks",
                "Automating invoice processing",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between p-3 rounded hover:bg-gray-100 dark:hover:bg-[#202222] cursor-pointer"
                >
                  <span>{item}</span>
                  <ArrowRight size={16} />
                </div>
              ))}
            </div>
          </div>

          {/* ======================= Right Panel ======================= */}

          <div className="w-full lg:w-80 space-y-6">

            {/* File Card */}
            <div className="bg-white dark:bg-[#202222] border rounded-xl p-2">
              <div className="relative aspect-[3/4] bg-gray-100 dark:bg-[#2a2c2c] rounded flex items-center justify-center">
                <ImageIcon size={48} />
                <button className="absolute top-2 right-2">
                  <Maximize2 size={16} />
                </button>
              </div>

              <div className="p-2">
                <p className="font-medium">Invoice_scan_001.png</p>
                <p className="text-xs text-gray-500">2.4 MB</p>
              </div>
            </div>

            {/* Export */}
            <div>
              <h3 className="text-xs font-semibold mb-2">Export As</h3>

              <div className="grid grid-cols-2 gap-2">
                <ExportButton icon={<FileSpreadsheet size={16} />} label="Excel" />
                <ExportButton icon={<FileSpreadsheet size={16} />} label="CSV" />
                <ExportButton icon={<FileJson size={16} />} label="JSON" />
                <ExportButton icon={<FileText size={16} />} label="PDF" />
              </div>
            </div>

          </div>

        </div>

        <div ref={bottomRef} />
      </div>

      {/* ======================= Input Bar ======================= */}

      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative">

          <input
            value={inputValue}
            disabled={loading}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a follow-up..."
            className="w-full p-3 pr-12 rounded-full border bg-white dark:bg-[#202222]"
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full
              ${
                inputValue.trim()
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-200 text-gray-400"
              }`}
          >
            <ArrowRight size={18} />
          </button>

        </form>
      </div>
    </div>
  );
}

/* ======================= Export Button ======================= */

function ExportButton({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button className="flex items-center justify-center gap-2 px-3 py-2 border rounded bg-white dark:bg-[#202222] hover:bg-emerald-50">
      {icon}
      {label}
    </button>
  );
}
