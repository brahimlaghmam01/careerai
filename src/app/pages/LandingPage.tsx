import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Bot, Zap, Shield, FileText, CheckCircle, Upload, Wand2, Target, ArrowRight } from "lucide-react";
import { Glass, PrimaryBtn, OutlineBtn, Orbs, Navbar, Footer, PricingCards, cn } from "../components/UI";
import { CookieConsent } from "../components/CookieConsent";


export default function LandingPage({ darkMode, setDarkMode }: { darkMode: boolean; setDarkMode: (v: boolean) => void }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full font-sans bg-[#F8FAFC] dark:bg-[#000000] text-slate-900 dark:text-slate-100 selection:bg-[#2563EB]/20 relative overflow-hidden transition-colors duration-300">
      <Orbs />
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <main className="pt-25 pb-20 min-h-screen w-full relative z-10">
        {/* Hero Section */}
        <div className="relative w-full h-full text-center max-w-8xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">

          {/* Background Video */}
          <video
            className="absolute left-0 top-15 w-full h-100% object-cover -z-10"

            src="/src/app/public/video/background.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />


          <div className="absolute inset-0 bg-transparent -z-10" />

        {/* 
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 backdrop-blur-md mb-8">
            <span className="flex h-2 w-2 rounded-full bg-[#2563EB] animate-pulse" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 tracking-wide uppercase">AI Model v4.0 is now live</span>
          </div>
          */}
          <h1 className="text-[2.5rem] md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 text-slate-900 dark:text-white">
            Land your dream job with
            <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#06B6D4] relative inline-block ml-3">
              AI-crafted applications
              <div className="absolute -bottom-2 left-0 right-0 h-3 bg-[#2563EB]/20 blur-lg -z-10" />
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop guessing what ATS wants. Our AI analyzes job descriptions, optimizes your CV, and generates tailored cover letters in seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <PrimaryBtn onClick={() => navigate("/signup")} className="w-full sm:w-auto py-4 px-8 text-base">
              Start Building Free <ArrowRight size={18} />
            </PrimaryBtn>
            <OutlineBtn onClick={() => navigate("/login")} className="w-full sm:w-auto py-4 px-8 text-base">
              See How It Works
            </OutlineBtn>
          </div>
          
          <div className="mt-12 flex flex-col items-center gap-3">
            <div className="flex -space-x-3">
              {[1,2,3,4].map((i) => (
                <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-10 h-10 rounded-full border-2 border-white dark:border-[#0F172A] object-cover" />
              ))}
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Trusted by <span className="text-slate-900 dark:text-white font-bold">10,000+</span> professionals
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to stand out</h2>
            <p className="text-slate-500 dark:text-slate-400">Powerful AI tools designed to get you past the ATS and into the interview room.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "ATS Optimization", desc: "Instantly check your CV against job descriptions to ensure you pass automated filters.", icon: Target, c: "text-emerald-500", bg: "bg-emerald-500/10" },
              { title: "AI Cover Letters", desc: "Generate highly personalized cover letters tailored to specific companies and roles.", icon: FileText, c: "text-blue-500", bg: "bg-blue-500/10" },
              { title: "Smart CV Builder", desc: "Create professional, beautifully designed CVs that highlight your actual impact.", icon: Sparkles, c: "text-violet-500", bg: "bg-violet-500/10" },
              { title: "Interview Prep", desc: "Practice with our AI bot that asks you role-specific questions and gives feedback.", icon: Bot, c: "text-cyan-500", bg: "bg-cyan-500/10" },
              { title: "Lightning Fast", desc: "Go from finding a job post to submitting a tailored application in under 2 minutes.", icon: Zap, c: "text-amber-500", bg: "bg-amber-500/10" },
              { title: "Data Privacy", desc: "Your career data is encrypted and never shared with employers without your consent.", icon: Shield, c: "text-rose-500", bg: "bg-rose-500/10" }
            ].map((f, i) => (
              <Glass key={i} className="p-6 group hover:border-[#2563EB]/30 transition-all duration-300">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 duration-300", f.bg)}>
                  <f.icon className={f.c} size={24} />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </Glass>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div id="pricing" className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-slate-500 dark:text-slate-400">Start for free, upgrade when you need more power.</p>
          </div>
          <PricingCards />
        </div>
      </main>
      
      <Footer />
      <CookieConsent />
    </div>
  );
}


