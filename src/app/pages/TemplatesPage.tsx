import { useNavigate } from "react-router-dom";
import { Layout, Check, FileText } from "lucide-react";
import { Glass, PrimaryBtn, cn } from "../components/UI";

const TEMPLATES = [
  { name: "Modern", desc: "Clean, single-column layout ideal for tech roles.", gradient: "from-[#2563EB] to-[#06B6D4]", tag: "Popular" },
  { name: "Professional", desc: "Classic two-column design for corporate roles.", gradient: "from-[#7C3AED] to-[#2563EB]", tag: "ATS-Friendly" },
  { name: "Minimal", desc: "Distraction-free design that lets content shine.", gradient: "from-slate-600 to-slate-800", tag: null },
  { name: "Creative", desc: "Bold accents for design and marketing roles.", gradient: "from-[#EC4899] to-[#7C3AED]", tag: "New" },
  { name: "Executive", desc: "Refined layout for senior leadership positions.", gradient: "from-[#0F766E] to-[#0891B2]", tag: null },
  { name: "Academic", desc: "Structured format for research and academia.", gradient: "from-[#B45309] to-[#92400E]", tag: null },
];

export default function TemplatesPage() {
  const navigate = useNavigate();

  return (
    <div className="p-5 md:p-6 max-w-5xl mx-auto space-y-5">
      <Glass className="p-6">
        <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
          <Layout className="text-[#2563EB]" size={20} /> Choose a Template
        </h2>
        <p className="text-sm text-slate-500 mt-1">Pick a professionally designed, ATS-optimized template to get started.</p>
      </Glass>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEMPLATES.map((t) => (
          <Glass key={t.name} className="p-4 flex flex-col group">
            <div className={cn("relative h-40 rounded-[14px] bg-gradient-to-br mb-4 overflow-hidden flex items-center justify-center", t.gradient)}>
              <FileText size={40} className="text-white/80" />
              {t.tag && (
                <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">{t.tag}</span>
              )}
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{t.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex-1 mb-3">{t.desc}</p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 mb-3">
              <Check size={12} /> ATS-optimized
            </div>
            <PrimaryBtn
              onClick={() => navigate(`/dashboard/cv?template=${encodeURIComponent(t.name)}`)}
              className="w-full py-2.5 text-xs"
            >
              Use Template
            </PrimaryBtn>

          </Glass>
        ))}
      </div>
    </div>
  );
}

