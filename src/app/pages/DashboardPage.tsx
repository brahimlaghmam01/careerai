import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home, FileText, Mail, MessageSquare, Compass, Layout, Settings,
  LogOut, Bot, Sparkles, Bell, Moon, Sun, Menu, Target
} from "lucide-react";
import { Glass, PrimaryBtn, Logo, cn } from "../components/UI";
import { useAuth } from "../lib/AuthContext";
import api from "../lib/api";
import CVBuilderPage from "./CVBuilderPage";

const SIDEBAR_NAV = [
  { icon: Home, label: "Dashboard", id: "home" },
  { icon: FileText, label: "CV Builder", id: "cv" },
  { icon: Mail, label: "Cover Letters", id: "letters" },
  { icon: MessageSquare, label: "Interview Prep", id: "interview" },
  { icon: Compass, label: "Career Advisor", id: "advisor" },
  { icon: Layout, label: "Templates", id: "templates" },
];

export default function DashboardPage({ darkMode, setDarkMode }: { darkMode: boolean; setDarkMode: (v: boolean) => void }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeNav, setActiveNav] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await api.get('/documents');
        setDocuments(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDocs();
  }, []);

  function Sidebar() {
    return (
      <aside className={cn(
        "fixed md:relative z-40 h-screen w-60 bg-white dark:bg-[#0F172A] border-r border-slate-100 dark:border-slate-800/70",
        "flex flex-col py-6 transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        "shrink-0"
      )}>
        <div className="px-5 mb-8">
          <Link to="/"><Logo /></Link>
        </div>
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {SIDEBAR_NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveNav(item.id);
                setSidebarOpen(false);

                // Navigate to the standalone routes so the added pages work from the sidebar
                switch (item.id) {
                  case "cv":
                    navigate("/cv-builder");
                    return;
                  case "letters":
                    navigate("/cover-letters");
                    return;
                  case "interview":
                    navigate("/interview-prep");
                    return;
                  case "advisor":
                    navigate("/career-advisor");
                    return;
                  case "templates":
                    navigate("/templates");
                    return;
                  case "home":
                  default:
                    navigate("/dashboard");
                    return;
                }
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium transition-all duration-150",
                activeNav === item.id
                  ? "bg-blue-50 dark:bg-blue-500/10 text-[#2563EB] dark:text-blue-400"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-200"
              )}
            >
              <item.icon size={15} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-3 border-t border-slate-100 dark:border-slate-800/70 pt-3 space-y-0.5 mt-3">
          <button
            onClick={() => {
              setActiveNav("settings");
              navigate("/settings");
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all"
          >
            <Settings size={15} />
            Settings
          </button>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
            <LogOut size={15} />
            Sign Out
          </button>
        </div>

      </aside>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] dark:bg-[#0F172A]">
      <Sidebar />
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 overflow-y-auto min-w-0">
        <div className="sticky top-0 z-20 bg-[#F8FAFC]/92 dark:bg-[#0F172A]/92 backdrop-blur-xl border-b border-slate-100/80 dark:border-slate-800/60 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden w-8 h-8 flex items-center justify-center text-slate-500">
              <Menu size={18} />
            </button>
            <div>
              <h1 className="text-sm font-semibold text-slate-900 dark:text-white">Dashboard</h1>
              <p className="text-xs text-slate-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button onClick={() => setDarkMode(!darkMode)} className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              {darkMode ? <Sun size={13} /> : <Moon size={13} />}
            </button>
            <button className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all relative">
              <Bell size={13} />
              <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white text-xs font-bold cursor-pointer">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </div>

        {activeNav === "home" && (
          <div className="p-5 md:p-6 max-w-5xl space-y-5">
            <div className="relative overflow-hidden bg-gradient-to-br from-[#2563EB] to-[#7C3AED] rounded-[20px] p-6 text-white">
              <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-white/[0.05] -translate-y-14 translate-x-14" />
              <div className="absolute bottom-0 right-24 w-36 h-36 rounded-full bg-white/[0.04] translate-y-10" />
              <div className="relative z-10">
                <p className="text-blue-200 text-sm mb-1">Good morning 👋</p>
                <h2 className="text-xl font-bold mb-1.5">Welcome back, {user?.name || 'User'}!</h2>
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
              {[
                { label: "CVs Generated", value: documents.filter(d => d.type === 'cv').length, icon: FileText, c: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
                { label: "Cover Letters", value: documents.filter(d => d.type === 'letter').length, icon: Mail, c: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-500/10" },
                { label: "Avg ATS Score", value: documents.length > 0 ? Math.round(documents.reduce((a,b) => a + (b.ats_score || 0), 0) / documents.length) + '%' : 'N/A', icon: Target, c: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
                { label: "Interview Prep", value: "0", icon: MessageSquare, c: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-500/10" },
              ].map((s, i) => (
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Your Documents</h3>
              </div>
              {documents.length === 0 ? (
                <div className="text-sm text-slate-500 text-center py-6">You haven't generated any documents yet.</div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc, i) => (
                    <div key={i} className="group flex items-center gap-3 p-3 rounded-[12px] hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all cursor-pointer border border-slate-100 dark:border-slate-800">
                      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", doc.type === 'cv' ? 'bg-blue-50 text-blue-500 dark:bg-blue-500/10' : 'bg-violet-50 text-violet-500 dark:bg-violet-500/10')}>
                        {doc.type === 'cv' ? <FileText size={14} /> : <Mail size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{doc.name}</div>
                        <div className="text-xs text-slate-400">{new Date(doc.created_at).toLocaleDateString()}</div>
                      </div>
                      {doc.ats_score && (
                        <div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          ATS {doc.ats_score}%
                        </div>
                      )}

                      <div className="flex items-center gap-2 ml-auto shrink-0">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const format = 'pdf';
                            try {
                              const res = await api.get(`/documents/${doc.id}/download`, { params: { format }, responseType: 'blob' });
                              const url = window.URL.createObjectURL(new Blob([res.data]));
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `${doc.name || 'document'}.pdf`;
                              document.body.appendChild(a);
                              a.click();
                              a.remove();
                              window.URL.revokeObjectURL(url);
                            } catch (err) {
                              console.error(err);
                              alert('Failed to download PDF.');
                            }
                          }}
                          className="text-[11px] font-semibold px-3 py-1 rounded-[999px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                          type="button"
                        >
                          PDF
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const format = 'docx';
                            try {
                              const res = await api.get(`/documents/${doc.id}/download`, { params: { format }, responseType: 'blob' });
                              const url = window.URL.createObjectURL(new Blob([res.data]));
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `${doc.name || 'document'}.docx`;
                              document.body.appendChild(a);
                              a.click();
                              a.remove();
                              window.URL.revokeObjectURL(url);
                            } catch (err) {
                              console.error(err);
                              alert('Failed to download DOCX.');
                            }
                          }}
                          className="text-[11px] font-semibold px-3 py-1 rounded-[999px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                          type="button"
                        >
                          DOCX
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Glass>
          </div>
        )}

        {activeNav === "cv" && (
          <div className="p-5 md:p-6 max-w-5xl mx-auto space-y-5">
             <CVBuilderPage />
          </div>
        )}
      </main>
    </div>
  );
}

