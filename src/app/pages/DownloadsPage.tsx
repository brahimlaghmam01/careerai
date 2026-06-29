import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Download, FileText, Mail } from "lucide-react";
import { Glass, cn, PrimaryBtn } from "../components/UI";
import api from "../lib/api";

type Format = "pdf" | "docx";

type DocumentRow = {
  id: number;
  name: string;
  type: string;
  created_at?: string;
  ats_score?: number | null;
};

const TEMPLATE_PARAM_KEY = "template";

async function downloadDocument(doc: DocumentRow, format: Format) {
  const res = await api.get(`/documents/${doc.id}/download`, {
    params: { format },
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([res.data]));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${doc.name || "document"}.${format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export default function DownloadsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectTo = searchParams.get("redirect") ?? "/dashboard";
  const template = searchParams.get(TEMPLATE_PARAM_KEY);

  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await api.get("/documents");
        const onlyCVs = (res.data || []).filter((d: any) => d.type === "cv");
        setDocuments(onlyCVs);
      } catch (e) {
        console.error(e);
        setError("Failed to load documents.");
      }
    };

    fetchDocs();
  }, []);

  const atsInfo = useMemo(() => {
    const scores = documents
      .map((d) => (typeof d.ats_score === "number" ? d.ats_score : null))
      .filter((v) => v !== null) as number[];

    if (!scores.length) return { avg: null as number | null, count: 0 };
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    return { avg, count: scores.length };
  }, [documents]);

  const canDownload = Boolean(template) && documents.length > 0;

  const handleDownloadAll = async (format: Format) => {
    if (!template) {
      navigate(`/dashboard/templates?redirect=${encodeURIComponent(redirectTo)}&template=__PENDING__`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Requirement: backend download does not accept template.
      // So we only use template selection as UX gate.
      for (const doc of documents) {
        try {
          await downloadDocument(doc, format);
        } catch (e) {
          console.error(e);
        }
      }

      navigate(redirectTo);
    } catch (e) {
      console.error(e);
      setError("Download failed. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 md:p-6 max-w-5xl mx-auto space-y-5">
      <Glass className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <Download className="text-[#2563EB]" size={20} /> Downloads
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              CV download ready{template ? ` with template: ${template}` : ". choose a template first"}.
            </p>
            {atsInfo.count > 0 ? (
              <p className="text-xs text-slate-400 mt-2">ATS scores found: {atsInfo.count} (avg {atsInfo.avg}%).</p>
            ) : null}
          </div>

          <PrimaryBtn
            onClick={() => navigate("/dashboard/templates?redirect=/dashboard/downloads")}
            className="py-2 px-4 text-xs"
          >
            Choose Template
          </PrimaryBtn>
        </div>
      </Glass>

      {error ? (
        <div className="text-[12px] text-red-500 dark:text-red-400">{error}</div>
      ) : null}

      <Glass className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Your CVs</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{documents.length} documents</div>
        </div>

        {documents.length === 0 ? (
          <div className="text-sm text-slate-500">No CVs found.</div>
        ) : (
          <div className="space-y-2">
            {documents.slice(0, 6).map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between gap-3 p-3 rounded-[12px] border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-50 text-blue-500 dark:bg-blue-500/10">
                    <FileText size={14} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{d.name}</div>
                    <div className="text-xs text-slate-400">{d.created_at ? new Date(d.created_at).toLocaleDateString() : ""}</div>
                  </div>
                </div>
                <div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300">
                  ATS {typeof d.ats_score === "number" ? `${d.ats_score}%` : "N/A"}
                </div>
              </div>
            ))}
            {documents.length > 6 ? (
              <div className="text-xs text-slate-400">And {documents.length - 6} more…</div>
            ) : null}
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          <PrimaryBtn
            onClick={() => handleDownloadAll("pdf")}
            className={cn(
              "flex-1 py-3",
              !canDownload || loading
                ? "opacity-50 pointer-events-none"
                : ""
            )}
          >
            {loading ? "Downloading…" : "Download all PDFs"}
          </PrimaryBtn>

          <PrimaryBtn
            onClick={() => handleDownloadAll("docx")}
            className={cn(
              "flex-1 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800",
              !canDownload || loading
                ? "opacity-50 pointer-events-none"
                : ""
            )}
          >
            {loading ? "Downloading…" : "Download all DOCX"}
          </PrimaryBtn>
        </div>

        {!template ? (
          <div className="text-[12px] text-slate-500 mt-3">
            Template selection is required before downloads.
          </div>
        ) : null}
      </Glass>
    </div>
  );
}

