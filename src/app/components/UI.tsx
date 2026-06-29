import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Sparkles, Moon, Sun, Menu, X, Check
} from "lucide-react";

export function cn(...cls: (string | undefined | false | null)[]) {
  return cls.filter(Boolean).join(" ");
}

export function Orbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute -top-56 -left-40 w-[750px] h-[750px] rounded-full bg-blue-500/[0.06] dark:bg-blue-400/[0.11] blur-[160px]" />
      <div className="absolute top-40 -right-32 w-[600px] h-[600px] rounded-full bg-violet-500/[0.06] dark:bg-violet-400/[0.11] blur-[140px]" />
      <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-cyan-400/[0.05] dark:bg-cyan-300/[0.09] blur-[120px]" />
    </div>
  );
}

export function Glass({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl",
        "border border-white/70 dark:border-slate-700/40",
        "rounded-[20px] shadow-[0_2px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_32px_rgba(0,0,0,0.28)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PrimaryBtn({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "bg-gradient-to-r from-[#2563EB] to-[#7C3AED]",
        "text-white font-semibold rounded-full px-6 py-3 text-sm",
        "hover:shadow-[0_8px_28px_rgba(37,99,235,0.38)] hover:-translate-y-0.5",
        "active:translate-y-0 transition-all duration-200 inline-flex items-center justify-center gap-2",
        className
      )}
    >
      {children}
    </button>
  );
}

export function OutlineBtn({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "border border-slate-200/90 dark:border-slate-700/70",
        "text-slate-700 dark:text-slate-200 font-semibold rounded-full px-6 py-3 text-sm",
        "hover:bg-slate-50/80 dark:hover:bg-slate-800/60 hover:-translate-y-0.5",
        "active:translate-y-0 transition-all duration-200 inline-flex items-center justify-center gap-2 bg-white/60 dark:bg-transparent backdrop-blur-sm",
        className
      )}
    >
      {children}
    </button>
  );
}

export function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 shrink-0">
      <img
        src="/src/app/public/img/careerAI LOGO.png"
        alt="CareerAI"
        className="w-8 h-8 rounded-[10px] object-contain"
        draggable={false}
      />
    </button>
  );
}


export function Navbar({ darkMode, setDarkMode }: { darkMode: boolean; setDarkMode: (v: boolean) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const links = [
    { label: "Features", path: "/" },
    { label: "Pricing", path: "/pricing" },
    { label: "Dashboard", path: "/dashboard" },
  ];

  return (
    <nav className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300", scrolled ? "py-2" : "py-4")}>
        <div className="max-w-6xl mx-auto px-4">
        <div className={cn(
          "flex items-center justify-between px-5 py-3 rounded-[20px] transition-all duration-300",
          scrolled
            ? "bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/50 shadow-xl shadow-slate-200/20 dark:shadow-black/30 backdrop-blur-2xl"
            : "bg-white/40 dark:bg-black/60 border border-white/50 dark:border-slate-700/20 backdrop-blur-xl"
        )}>
          <Logo onClick={() => navigate("/")} />

          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <button
                key={l.label}
                onClick={() => navigate(l.path)}
                className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/50 transition-all duration-150 font-medium"
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2.5">
            {/*<button
              onClick={() => setDarkMode(!darkMode)}
              className="w-9 h-9 rounded-xl border border-slate-200/80 dark:border-slate-700/50 flex items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              {darkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>*/}
            <OutlineBtn onClick={() => navigate("/login")} className="py-2 px-4 text-xs rounded-full">Sign In</OutlineBtn>
            <PrimaryBtn onClick={() => navigate("/signup")} className="py-2 px-4 text-xs rounded-full">Get Started Free</PrimaryBtn>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button onClick={() => setDarkMode(!darkMode)} className="w-8 h-8 flex items-center justify-center text-slate-400">
              {darkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button onClick={() => setOpen(!open)} className="w-8 h-8 flex items-center justify-center text-slate-500">
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="mt-2 p-4 rounded-[20px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/60 dark:border-slate-700/50 shadow-2xl space-y-1">
            {links.map((l) => (
              <button
                key={l.label}
                onClick={() => { navigate(l.path); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                {l.label}
              </button>
            ))}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2 mt-2">
              <OutlineBtn onClick={() => { navigate("/login"); setOpen(false); }} className="flex-1 py-2 text-xs">Sign In</OutlineBtn>
              <PrimaryBtn onClick={() => { navigate("/signup"); setOpen(false); }} className="flex-1 py-2 text-xs">Get Started</PrimaryBtn>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="border-t border-slate-100 dark:border-slate-800/60 py-14 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <Logo onClick={() => navigate("/")} />
            <p className="text-slate-400 dark:text-slate-500 text-sm leading-relaxed max-w-xs mt-4">
              AI-powered career tools that help students and professionals land their dream jobs faster.
            </p>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Product</div>
            {["Features", "Pricing", "Templates", "Blog", "Changelog"].map((l) => (
              <div key={l} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-2.5 cursor-pointer transition-colors duration-150">{l}</div>
            ))}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Company</div>
            {[
              { label: "About", path: "/about" },
              { label: "Privacy", path: "/privacy" },
              { label: "Terms", path: "/terms" },
              { label: "Contact", path: "/contact" },
              { label: "Status", path: "/status" },
            ].map((l) => (
              <div
                key={l.label}
                role="link"
                onClick={() => navigate(l.path)}
                className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-2.5 cursor-pointer transition-colors duration-150"
              >
                {l.label}
              </div>
            ))}
          </div>

        </div>
        <div className="border-t border-slate-100 dark:border-slate-800/60 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400">© 2025 CareerAI, Inc. All rights reserved.</div>
          <div className="text-xs text-slate-400">Built for job seekers worldwide 🌍</div>
        </div>
      </div>
    </footer>
  );
}

export function PricingCards() {
  const navigate = useNavigate();
  const free = ["5 CV generations / month", "3 Cover letters / month", "Basic ATS checker", "1 template", "PDF export"];
  const premium = [
    "Unlimited CV generation", "Unlimited cover letters", "Advanced ATS optimization",
    "50+ premium templates", "PDF + DOCX export", "Interview coaching",
    "Career advisor", "Multi-language (25+ languages)", "Priority AI model", "24/7 support",
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
      <Glass className="p-8 flex flex-col">
        <div className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-6">Free Plan</div>
        <div className="text-4xl font-bold text-slate-900 dark:text-white mb-1">$0</div>
        <div className="text-slate-400 text-sm mb-8">Forever free, no card needed</div>
        <ul className="space-y-3 mb-8 flex-1">
          {free.map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <Check size={13} className="text-slate-300 dark:text-slate-600 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <OutlineBtn onClick={() => navigate("/signup")} className="w-full">Get Started Free</OutlineBtn>
      </Glass>

      <div className="relative rounded-[20px] p-px bg-gradient-to-br from-[#2563EB] via-[#7C3AED] to-[#06B6D4]">
        <div className="bg-gradient-to-br from-[#1E3A8A] to-[#3B0764] rounded-[19px] p-8 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="text-xs font-bold text-blue-300 tracking-widest uppercase">Premium Plan</div>
            <div className="px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[#67E8F9] text-[10px] font-bold uppercase tracking-wider">Most Popular</div>
          </div>
          <div className="text-4xl font-bold text-white mb-1">$19</div>
          <div className="text-blue-300/60 text-sm mb-8">per month, cancel anytime</div>
          <ul className="space-y-2.5 mb-8 flex-1">
            {premium.map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-blue-100/80">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#06B6D4] to-[#2563EB] flex items-center justify-center shrink-0">
                  <Check size={9} className="text-white" />
                </div>
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={() => navigate("/signup")}
            className="w-full py-3.5 rounded-full bg-white text-[#1E3A8A] font-bold text-sm hover:bg-blue-50 active:scale-[0.98] transition-all duration-200"
          >
            Start Free Trial →
          </button>
        </div>
      </div>
    </div>
  );
}
