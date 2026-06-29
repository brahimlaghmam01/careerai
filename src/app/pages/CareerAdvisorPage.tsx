import { useState } from "react";
import { Compass, Send, Bot, User as UserIcon } from "lucide-react";
import { Glass, cn } from "../components/UI";

type Msg = { role: "bot" | "user"; text: string };

const SUGGESTIONS = [
  "How do I switch careers into tech?",
  "What skills are in demand for 2026?",
  "How can I negotiate a higher salary?",
  "Tips to grow my professional network",
];

const ADVICE: Record<string, string> = {
  career: "Start by mapping your transferable skills to your target role. Build a focused portfolio, take one recognized certification, and network with people already in the field. Small, consistent steps beat a single big leap.",
  skills: "In-demand skills include AI/ML literacy, data analysis, cloud platforms, and strong communication. Pair one technical skill with a durable soft skill like problem-solving to stand out.",
  salary: "Research market rates first, then anchor high but reasonable. Highlight quantified achievements, practice your delivery, and never accept on the spot — ask for time to consider.",
  network: "Give before you ask: share useful content, comment thoughtfully, and offer help. Aim for 2-3 genuine conversations a week rather than mass connection requests.",
};

function reply(input: string) {
  const t = input.toLowerCase();
  if (t.includes("switch") || t.includes("career") || t.includes("change")) return ADVICE.career;
  if (t.includes("skill") || t.includes("demand") || t.includes("learn")) return ADVICE.skills;
  if (t.includes("salary") || t.includes("negotiat") || t.includes("pay")) return ADVICE.salary;
  if (t.includes("network") || t.includes("connect")) return ADVICE.network;
  return "Great question! Focus on clarifying your goal, identifying the gap between where you are and where you want to be, and taking one concrete action this week. Want tips on skills, salary, or networking?";
}

export default function CareerAdvisorPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "bot", text: "Hi! I'm your AI Career Advisor. Ask me anything about your career path, skills, or job search." },
  ]);
  const [input, setInput] = useState("");

  const send = (text: string) => {
    const value = text.trim();
    if (!value) return;
    setMessages((m) => [...m, { role: "user", text: value }, { role: "bot", text: reply(value) }]);
    setInput("");
  };

  return (
    <div className="p-5 md:p-6 max-w-3xl mx-auto flex flex-col h-[calc(100vh-73px)]">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Minimal top bar */}
        <div className="flex items-center gap-2 mb-3">
          <Compass className="text-[#2563EB]" size={18} />
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Career Advisor</h2>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white",
                    m.role === "bot" ? "bg-gradient-to-br from-[#2563EB] to-[#7C3AED]" : "bg-slate-400 dark:bg-slate-600"
                  )}
                >
                  {m.role === "bot" ? <Bot size={15} /> : <UserIcon size={15} />}
                </div>

                <div
                  className={cn(
                    "max-w-[78%] text-sm leading-relaxed px-3 py-2.5",
                    // More minimal bubble rounding/spacing (still same colors)
                    m.role === "bot"
                      ? "bg-slate-100/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 rounded-xl"
                      : "bg-[#2563EB] text-white rounded-xl"
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="pt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Minimal input bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="mt-4 flex items-center gap-2 p-0 border-t border-slate-100 dark:border-slate-800/60"
        >
          <div className="w-full flex items-center gap-2 py-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your career question..."
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            />
            <button
              type="submit"
              className="w-10 h-10 rounded-full bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white flex items-center justify-center hover:-translate-y-0.5 transition-all"
            >
              <Send size={15} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


