import { useNavigate } from "react-router-dom";
import { Glass, PrimaryBtn } from "../components/UI";

export default function PrivacyPage({ darkMode }: { darkMode: boolean }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold">Privacy Policy</h1>
          <PrimaryBtn onClick={() => navigate("/dashboard")} className="hidden sm:inline-flex">
            Go to Dashboard
          </PrimaryBtn>
        </div>

        <Glass className="p-8">
          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              This is a placeholder privacy policy. Replace this text with your official policy.
            </p>
            <p>
              We aim to collect only what is needed to provide the service, and we recommend reviewing
              your usage settings and account data.
            </p>
            <p>
              If you integrate analytics, payments, or other third-party services, list them here.
            </p>
          </div>
        </Glass>
      </div>
    </div>
  );
}

