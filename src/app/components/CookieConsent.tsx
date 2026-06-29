import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "./UI";
import { PrimaryBtn, Glass } from "./UI";
import { Link } from "react-router-dom";

const STORAGE_KEY = "cookie_consent_v1";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "accepted") {
        setAccepted(true);
        setVisible(false);
        return;
      }
    } catch {
      // ignore
    }

    // Show on first visit
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4">
      <div className="max-w-5xl mx-auto">
        <Glass className={cn("p-5 sm:p-6")}> 
          <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-xl bg-[#2563EB]/10 dark:bg-[#2563EB]/15 flex items-center justify-center">
                  <Check className="text-[#2563EB]" size={18} />
                </div>
                <div className="font-bold text-slate-900 dark:text-white">Cookies & Privacy</div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                We use cookies to improve your experience and analyze site traffic. By accepting,
                you agree to our cookie policy.
              </p>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                <span className="font-semibold">Links:</span>{" "}
                <Link className="underline hover:text-slate-900 dark:hover:text-white" to="/about">
                  About
                </Link>{" "}
                ·{" "}
                <Link className="underline hover:text-slate-900 dark:hover:text-white" to="/terms">
                  Terms
                </Link>{" "}
                ·{" "}
                <Link className="underline hover:text-slate-900 dark:hover:text-white" to="/privacy">
                  Privacy
                </Link>{" "}
                ·{" "}
                <Link className="underline hover:text-slate-900 dark:hover:text-white" to="/contact">
                  Contact
                </Link>{" "}
                ·{" "}
                <Link className="underline hover:text-slate-900 dark:hover:text-white" to="/status">
                  Status
                </Link>
              </div>
            </div>

            <div className="lg:w-[220px] flex lg:flex-col gap-2 justify-end">
              <button
                onClick={() => {
                  setAccepted(true);
                  setVisible(false);
                  try {
                    localStorage.setItem(STORAGE_KEY, "accepted");
                  } catch {
                    // ignore
                  }
                }}
                className={cn(
                  "w-full",
                  "bg-[#2563EB] text-white font-semibold rounded-xl px-4 py-3 text-sm",
                  "hover:shadow-[0_10px_30px_rgba(37,99,235,0.35)] transition-all duration-200"
                )}
              >
                Accept Cookies
              </button>

              <button
                onClick={() => {
                  setVisible(false);
                  try {
                    localStorage.setItem(STORAGE_KEY, "dismissed");
                  } catch {
                    // ignore
                  }
                }}
                className={cn(
                  "w-full",
                  "border border-slate-200 dark:border-slate-700/60",
                  "text-slate-700 dark:text-slate-200 font-semibold rounded-xl px-4 py-3 text-sm",
                  "hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-all duration-200"
                )}
              >
                Manage Later
              </button>

              {accepted && (
                <div className="hidden">
                  {/* placeholder */}
                </div>
              )}
            </div>
          </div>
        </Glass>
      </div>
    </div>
  );
}

