import { useNavigate } from "react-router-dom";
import { Glass, PrimaryBtn, cn } from "../components/UI";

export default function AboutPage({ darkMode }: { darkMode: boolean }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold">About CareerAI</h1>
          <PrimaryBtn onClick={() => navigate("/dashboard")} className="hidden sm:inline-flex">
            Go to Dashboard
          </PrimaryBtn>
        </div>

        <div className={cn("grid gap-6", "md:grid-cols-1")}>
          <Glass className="p-8">
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              CareerAI helps students and professionals create ATS-ready CVs and cover letters,
              with AI-guided suggestions and structured outputs designed to improve interview
              readiness.
            </p>
            <div className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div>
                <span className="font-semibold">Our mission:</span> Make job applications faster,
                clearer, and more effective.
              </div>
              <div>
                <span className="font-semibold">Our values:</span> Privacy, accuracy, and
                actionable guidance.
              </div>
            </div>
          </Glass>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: "ATS Optimized", desc: "Structured formatting that matches what recruiters expect." },
              { title: "Tailored Writing", desc: "Cover letters that align with the job description." },
              { title: "Guided Prep", desc: "Interview practice built around real questions." },
            ].map((x) => (
              <Glass key={x.title} className="p-5">
                <div className="font-bold text-slate-900 dark:text-white mb-2">{x.title}</div>
                <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{x.desc}</div>
              </Glass>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

