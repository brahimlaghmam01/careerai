import { useEffect, useState } from "react";

import { Link, NavLink, useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  Home, FileText, Mail, MessageSquare, Compass, Layout, Settings,
  LogOut, Bell, Moon, Sun, Menu
} from "lucide-react";
import { Logo, cn } from "../components/UI";
import { useAuth } from "../lib/AuthContext";

const NAV = [
  { icon: Home, label: "Dashboard", path: "/dashboard", end: true, subtitle: "Your career command center" },
  { icon: FileText, label: "CV Builder", path: "/dashboard/cv", subtitle: "Craft an ATS-ready resume with AI" },
  { icon: Mail, label: "Cover Letters", path: "/dashboard/letters", subtitle: "Generate tailored cover letters" },
  { icon: MessageSquare, label: "Interview Prep", path: "/dashboard/interview", subtitle: "Practice with curated questions" },
  { icon: Compass, label: "Career Advisor", path: "/dashboard/advisor", subtitle: "Get personalized guidance" },
  { icon: Layout, label: "Templates", path: "/dashboard/templates", subtitle: "Pick a professional template" },
];

const SETTINGS = { icon: Settings, label: "Settings", path: "/dashboard/settings", subtitle: "Manage your account" };

export default function DashboardLayout({ darkMode, setDarkMode }: { darkMode: boolean; setDarkMode: (v: boolean) => void }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHoveringNavbar, setIsHoveringNavbar] = useState(false);

  useEffect(() => {
    const el = document.getElementById("dashboard-scroll-container");
    if (!el) return;

    const onScroll = () => setIsScrolled(el.scrollTop > 10);

    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const current = [...NAV, SETTINGS].find((n) => n.path === pathname) ?? NAV[0];



  const navItemCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      "w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium transition-all duration-150",
      isActive
        ? "bg-blue-50 dark:bg-blue-500/10 text-[#2563EB] dark:text-blue-400"
        : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-200"
    );

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] dark:bg-[#0F172A]">
      <aside className={cn(
        "fixed md:relative z-40 h-screen w-60 bg-white dark:bg-[#0F172A] border-r border-slate-100 dark:border-slate-800/70",
        "flex flex-col py-6 transition-transform duration-300 shrink-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="px-5 mb-8">
          <Link to="/">
            <Logo />
          </Link>
        </div>
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={navItemCls}
            >
              <item.icon size={15} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 border-t border-slate-100 dark:border-slate-800/70 pt-3 space-y-0.5 mt-3">
          <NavLink to={SETTINGS.path} onClick={() => setSidebarOpen(false)} className={navItemCls}>
            <Settings size={15} />
            Settings
          </NavLink>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <main id="dashboard-scroll-container" className="flex-1 overflow-y-auto min-w-0">

        <div
          onMouseEnter={() => setIsHoveringNavbar(true)}
          onMouseLeave={() => setIsHoveringNavbar(false)}
          className={cn(
            "sticky top-0 z-20 bg-[#F8FAFC]/92 dark:bg-[#0F172A]/92 backdrop-blur-xl border-b border-slate-100/80 dark:border-slate-800/60 flex items-center justify-between transition-[padding] duration-200",
            isScrolled && !isHoveringNavbar ? "px-3 py-2" : "px-6 py-4"
          )}
        >
          <div className="flex items-center gap-3">

            <button onClick={() => setSidebarOpen(true)} className="md:hidden w-8 h-8 flex items-center justify-center text-slate-500">
              <Menu size={18} />
            </button>
            <div>
              <h1
                className={cn(
                  "font-semibold text-slate-900 dark:text-white transition-[font-size] duration-200",
                  isScrolled && !isHoveringNavbar ? "text-[13px]" : "text-sm"
                )}
              >
                {current.label}
              </h1>
              <p
                className={cn(
                  "transition-[font-size] duration-200 text-slate-400",
                  isScrolled && !isHoveringNavbar ? "text-[11px]" : "text-xs"
                )}
              >
                {current.subtitle}
              </p>
            </div>

          </div>
          <div className="flex items-center gap-2.5">
            <button onClick={() => setDarkMode(!darkMode)} className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              {darkMode ? <Sun size={13} /> : <Moon size={13} />}
            </button>
            <button className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all relative">
              <Bell size={13} />
              <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
            </button>
            <button
              onClick={() => navigate("/dashboard/settings")}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white text-xs font-bold"
            >
              {user?.name?.[0]?.toUpperCase() || "U"}
            </button>
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
