import { useNavigate } from "react-router-dom";
import { Glass, PrimaryBtn } from "../components/UI";

export default function ContactPage({ darkMode }: { darkMode: boolean }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold">Contact</h1>
          <PrimaryBtn onClick={() => navigate("/dashboard")} className="hidden sm:inline-flex">
            Go to Dashboard
          </PrimaryBtn>
        </div>

        <Glass className="p-8">
          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              This is a placeholder contact page. Add your email, support form, and any relevant contact info.
            </p>
            <p>
              Suggested: support@yourdomain.com
            </p>
          </div>
        </Glass>
      </div>
    </div>
  );
}

