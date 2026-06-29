import { useNavigate } from "react-router-dom";
import { Glass, PrimaryBtn } from "../components/UI";

export default function StatusPage({ darkMode }: { darkMode: boolean }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold">Service Status</h1>
          <PrimaryBtn onClick={() => navigate("/dashboard")} className="hidden sm:inline-flex">
            Go to Dashboard
          </PrimaryBtn>
        </div>

        <Glass className="p-8">
          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              This is a placeholder status page. Connect it to your monitoring provider or internal status.
            </p>
            <div className="flex items-center gap-3">
              <span className="inline-flex w-3 h-3 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-200">All systems operational</span>
            </div>
          </div>
        </Glass>
      </div>
    </div>
  );
}

