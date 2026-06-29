import { useState } from "react";
import { MessageSquare, ChevronDown, Lightbulb, Target, Users } from "lucide-react";
import { Glass, cn } from "../components/UI";

const CATEGORIES = [
  { id: "behavioral", label: "Behavioral", icon: Users },
  { id: "technical", label: "Technical", icon: Target },
  { id: "general", label: "General", icon: Lightbulb },
];

const QUESTIONS: Record<string, { q: string; tip: string }[]> = {
  behavioral: [
    { q: "Tell me about a time you faced a conflict at work.", tip: "Use the STAR method: Situation, Task, Action, Result. Focus on how you resolved it constructively." },
    { q: "Describe a project you're most proud of.", tip: "Quantify the impact with metrics and highlight your specific contribution." },
    { q: "How do you handle tight deadlines?", tip: "Show prioritization, communication, and a concrete example of delivering under pressure." },
  ],
  technical: [
    { q: "Walk me through how you'd design a scalable system.", tip: "Clarify requirements first, then discuss trade-offs (caching, load balancing, databases)." },
    { q: "How do you debug a production issue?", tip: "Describe a systematic approach: reproduce, isolate, log, fix, and add monitoring." },
    { q: "Explain a technical concept to a non-technical person.", tip: "Use analogies and avoid jargon to demonstrate clear communication." },
  ],
  general: [
    { q: "Why do you want to work here?", tip: "Connect the company's mission and values to your own career goals." },
    { q: "What are your strengths and weaknesses?", tip: "Be honest about a weakness and show what you're doing to improve it." },
    { q: "Where do you see yourself in 5 years?", tip: "Show ambition that aligns with a realistic growth path at the company." },
  ],
};

export default function InterviewPrepPage() {
  const [category, setCategory] = useState("behavioral");
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="p-5 md:p-6 max-w-5xl mx-auto space-y-5">
      <Glass className="p-6 bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white border-0">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
          <MessageSquare size={20} /> Ace Your Next Interview
        </h2>
        <p className="text-blue-100/90 text-sm">Practice with curated questions and expert tips tailored to each interview stage.</p>
      </Glass>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => { setCategory(c.id); setOpen(0); }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
              category === c.id
                ? "bg-[#2563EB] text-white"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60"
            )}
          >
            <c.icon size={14} /> {c.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {QUESTIONS[category].map((item, i) => (
          <Glass key={i} className="p-0 overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-3 p-5 text-left"
            >
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{item.q}</span>
              <ChevronDown size={16} className={cn("text-slate-400 transition-transform shrink-0", open === i && "rotate-180")} />
            </button>
            {open === i && (
              <div className="px-5 pb-5 -mt-1">
                <div className="flex gap-3 text-sm text-slate-600 dark:text-slate-300 bg-blue-50/60 dark:bg-blue-500/5 p-4 rounded-xl border border-blue-100 dark:border-blue-500/10">
                  <Lightbulb size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <span><span className="font-semibold text-slate-700 dark:text-slate-200">Tip: </span>{item.tip}</span>
                </div>
              </div>
            )}
          </Glass>
        ))}
      </div>
    </div>
  );
}

