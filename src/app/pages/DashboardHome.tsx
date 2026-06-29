import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { FileText, Mail, Target, MessageSquare, Plus, ArrowRight, Download } from "lucide-react";
import { Glass, PrimaryBtn, cn } from "../components/UI";
import { useAuth } from "../lib/AuthContext";
import api from "../lib/api";


export default function DashboardHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await api.get("/documents");
        setDocuments(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDocs();
  }, []);

  async function downloadDocument(doc: any, format: "pdf" | "docx") {
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


  const stats = [
    { label: "CVs Generated", value: documents.filter((d) => d.type === "cv").length, icon: FileText, c: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
    { label: "Cover Letters", value: documents.filter((d) => d.type === "letter").length, icon: Mail, c: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-500/10" },
    { label: "Avg ATS Score", value: documents.length > 0 ? Math.round(documents.reduce((a, b) => a + (b.ats_score || 0), 0) / documents.length) + "%" : "N/A", icon: Target, c: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
    { label: "Interview Prep", value: "0", icon: MessageSquare, c: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-500/10" },
  ];

  return (
    <div className="p-5 md:p-6 max-w-5xl space-y-5">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#2563EB] to-[#7C3AED] rounded-[20px] p-6 text-white">
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-white/[0.05] -translate-y-14 translate-x-14" />
        <div className="absolute bottom-0 right-24 w-36 h-36 rounded-full bg-white/[0.04] translate-y-10" />
        <div className="relative z-10">
          <p className="text-blue-200 text-sm mb-1">Good morning 👋</p>
          <h2 className="text-xl font-bold mb-1.5">Welcome back, {user?.name || "User"}!</h2>
          <p className="text-blue-200/80 text-sm mb-4">Your profile is 78% complete. Finish it to boost your ATS score.</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white/15 rounded-full h-1.5 max-w-xs">
              <div className="bg-white rounded-full h-1.5" style={{ width: "78%" }} />
            </div>
            <span className="text-xs text-blue-200 font-semibold">78%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <Glass key={i} className="p-4">
            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-3", s.bg)}>
              <s.icon size={14} className={s.c} />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mb-0.5">{s.value}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{s.label}</div>
          </Glass>
        ))}
      </div>

      <Glass className="p-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Quick Actions</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { label: "New CV", to: "/dashboard/cv", icon: FileText },
            { label: "Cover Letter", to: "/dashboard/letters", icon: Mail },
            { label: "Interview Prep", to: "/dashboard/interview", icon: MessageSquare },
          ].map((a) => (
            <Link key={a.to} to={a.to} className="flex items-center gap-3 p-3 rounded-[12px] border border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all group">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <a.icon size={14} />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200 flex-1">{a.label}</span>
              <ArrowRight size={14} className="text-slate-300 group-hover:text-[#2563EB] transition-colors" />
            </Link>
          ))}
        </div>
      </Glass>

      <Glass className="p-5">
        <div className="flex items-center justify-between mb-4 gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Your Documents</h3>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {documents.length} document(s)
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/dashboard/cv">
              <PrimaryBtn className="py-2 px-4 text-xs"><Plus size={13} /> New</PrimaryBtn>
            </Link>
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="text-sm text-slate-500 text-center py-6">You haven't generated any documents yet.</div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc, i) => (
              <div
                key={i}
                className="group flex items-center gap-3 p-3 rounded-[12px] hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all border border-slate-100 dark:border-slate-800"
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                    doc.type === "cv"
                      ? "bg-blue-50 text-blue-500 dark:bg-blue-500/10"
                      : "bg-violet-50 text-violet-500 dark:bg-violet-500/10"
                  )}
                >
                  {doc.type === "cv" ? <FileText size={14} /> : <Mail size={14} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{doc.name}</div>
                  <div className="text-xs text-slate-400">{new Date(doc.created_at).toLocaleDateString()}</div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div>
                    {typeof doc.ats_score === "number" ? (
                      <div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        ATS {doc.ats_score}%
                      </div>
                    ) : (
                      <div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300">
                        ATS N/A
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      // Require user to choose a template before downloading a CV.
                      if (doc.type === "cv") {
                        navigate(`/dashboard/templates?redirect=/dashboard/downloads`);
                        return;
                      }
                      downloadDocument(doc, "pdf");
                    }}
                    className="text-[11px] font-semibold px-3 py-1 rounded-[999px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-1"
                    title="Download PDF"
                  >
                    <Download size={13} /> PDF
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (doc.type === "cv") {
                        navigate(`/dashboard/templates?redirect=/dashboard/downloads`);
                        return;
                      }
                      downloadDocument(doc, "docx");
                    }}
                    className="text-[11px] font-semibold px-3 py-1 rounded-[999px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-1"
                    title="Download DOCX"
                  >
                    <Download size={13} /> DOCX
                  </button>

                </div>
              </div>
            ))}

          </div>
        )}
      </Glass>
    </div>
  );
}
