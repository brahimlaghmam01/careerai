import { useState } from "react";
import { Mail, Wand2, Save, Sparkles } from "lucide-react";
import { Glass, PrimaryBtn, OutlineBtn } from "../components/UI";
import api from "../lib/api";

const inputCls = "w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-[12px] px-4 py-3 text-sm text-slate-700 dark:text-slate-200";

export default function CoverLettersPage() {
  const [form, setForm] = useState({ fullName: "", jobTitle: "", company: "", highlights: "" });
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = () => {
    setLoading(true);
    setTimeout(() => {
      const body = `Dear Hiring Manager,\n\nI am writing to express my strong interest in the ${form.jobTitle || "advertised"} role at ${form.company || "your company"}. With a proven track record and genuine passion for this field, I am confident I would be a valuable addition to your team.\n\n${form.highlights ? `In my previous experience, ${form.highlights}.` : "Throughout my career I have consistently delivered measurable results and embraced new challenges."} I am particularly drawn to ${form.company || "your organization"} because of its reputation for innovation and excellence.\n\nI would welcome the opportunity to discuss how my background aligns with your needs. Thank you for your time and consideration.\n\nSincerely,\n${form.fullName || "Your Name"}`;
      setLetter(body);
      setLoading(false);
    }, 700);
  };

  const save = async () => {
    try {
      await api.post("/documents", {
        type: "letter",
        name: `Cover Letter — ${form.jobTitle || "Untitled"}${form.company ? " @ " + form.company : ""}`,
        content: { body: letter },
        ats_score: Math.floor(Math.random() * 15) + 82,
      });
      alert("Cover letter saved to your Dashboard!");
    } catch (err) {
      console.error(err);
      alert("Failed to save cover letter.");
    }
  };

  return (
    <div className="p-5 md:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <Glass className="p-6">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
              <Mail className="text-violet-500" size={20} /> Letter Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Your Name</label>
                <input className={inputCls} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="e.g. Jane Doe" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Job Title</label>
                <input className={inputCls} value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} placeholder="e.g. Product Designer" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Company</label>
                <input className={inputCls} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="e.g. Acme Inc." />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Key Highlights</label>
                <textarea rows={4} className={inputCls} value={form.highlights} onChange={(e) => setForm({ ...form, highlights: e.target.value })} placeholder="I led a team of 5 and increased revenue by 30%..." />
              </div>
              <PrimaryBtn onClick={generate} className="w-full py-3.5 mt-2">
                {loading ? <span className="flex items-center gap-2"><Sparkles className="animate-pulse" size={16} /> Writing...</span> : <span className="flex items-center gap-2"><Wand2 size={16} /> Generate Cover Letter</span>}
              </PrimaryBtn>
            </div>
          </Glass>
        </div>

        <div className="flex-1">
          <Glass className="p-6 h-full flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100 dark:border-slate-800/60">
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <Sparkles className="text-violet-500" size={20} /> Preview
              </h2>
              {letter && (
                <OutlineBtn onClick={save} className="py-2 px-4 text-xs h-auto"><Save size={14} /> Save</OutlineBtn>
              )}
            </div>
            {letter ? (
              <div className="flex-1 overflow-y-auto text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {letter}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <Mail size={48} className="mb-4 text-slate-300 dark:text-slate-700" />
                <p>Fill out the details and click generate</p>
                <p className="text-xs mt-1">We'll draft a professional cover letter for you.</p>
              </div>
            )}
          </Glass>
        </div>
      </div>
    </div>
  );
}

