import { useState } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun, ArrowRight } from "lucide-react";
import { Glass, PrimaryBtn, Logo, Orbs } from "../components/UI";
import { useAuth } from "../lib/AuthContext";

export default function AuthPage({ type, darkMode, setDarkMode }: { type: "login" | "signup"; darkMode: boolean; setDarkMode: (v: boolean) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const { login, register } = useAuth();
  const isLogin = type === "login";


  const inputCls = "w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-[12px] px-4 py-3 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]/40 transition-all";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        await register({ name, email, password });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex items-center justify-center px-4 relative overflow-hidden">
      <Orbs />
      <div className="fixed top-5 left-5 z-50">
        <Link to="/"><Logo /></Link>
      </div>
      <div className="fixed top-5 right-5 z-50">
        <button onClick={() => setDarkMode(!darkMode)} className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-all backdrop-blur-sm">
          {darkMode ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>

      <Glass className="w-full max-w-sm p-8 relative z-10">
        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isLogin ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">
            {isLogin ? "Sign in to your CareerAI account" : "Start building your dream career today"}
          </p>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-500 text-center bg-red-50 dark:bg-red-500/10 p-2 rounded-md">
            {error}
          </div>
        )}

        {/* Google */}
        <button className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-[12px] border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98] transition-all mb-5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
          <span className="text-xs text-slate-400">or</span>
          <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mb-5">
          {!isLogin && (
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Johnson" className={inputCls} />
            </div>
          )}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
          </div>
          
          <PrimaryBtn className="w-full py-3.5 text-sm rounded-full mt-4">
            {submitting ? (
              <span className="inline-flex items-center gap-2 justify-center">
                <span className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                {isLogin ? "Signing In..." : "Creating..."}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 justify-center">
                {isLogin ? "Sign In" : "Create Account"} <ArrowRight size={13} />
              </span>
            )}
          </PrimaryBtn>
        </form>

        <p className="text-center text-xs text-slate-400 mt-5">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Link to={isLogin ? "/signup" : "/login"} className="text-[#2563EB] font-bold hover:underline">
            {isLogin ? "Sign up free" : "Sign in"}
          </Link>
        </p>
      </Glass>
    </div>
  );
}
