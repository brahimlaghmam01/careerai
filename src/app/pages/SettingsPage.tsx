import { useState, useEffect } from "react";
import { User as UserIcon, Bell, Shield, LogOut } from "lucide-react";
import { Glass, PrimaryBtn, OutlineBtn } from "../components/UI";
import { useAuth } from "../lib/AuthContext";

const inputCls = "w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-[12px] px-4 py-3 text-sm text-slate-700 dark:text-slate-200";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailNotif, setEmailNotif] = useState(true);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  return (
    <div className="p-5 md:p-6 max-w-3xl mx-auto space-y-5">
      <Glass className="p-6">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-5 text-slate-900 dark:text-white">
          <UserIcon className="text-[#2563EB]" size={20} /> Profile
        </h2>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white text-xl font-bold">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</div>
            <div className="text-xs text-slate-400">{user?.email}</div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Full Name</label>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Email</label>
            <input className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <PrimaryBtn onClick={() => alert("Profile saved!")} className="py-2.5 px-5 text-sm">Save Changes</PrimaryBtn>
        </div>
      </Glass>

      <Glass className="p-6">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
          <Bell className="text-violet-500" size={20} /> Notifications
        </h2>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-slate-600 dark:text-slate-300">Email me product updates and tips</span>
          <button
            type="button"
            onClick={() => setEmailNotif(!emailNotif)}
            className={`w-11 h-6 rounded-full transition-all relative ${emailNotif ? "bg-[#2563EB]" : "bg-slate-300 dark:bg-slate-700"}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${emailNotif ? "left-[22px]" : "left-0.5"}`} />
          </button>
        </label>
      </Glass>

      <Glass className="p-6">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
          <Shield className="text-emerald-500" size={20} /> Account
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Sign out of your account on this device.</p>
        <OutlineBtn onClick={logout} className="py-2.5 px-5 text-sm text-red-500 border-red-200 dark:border-red-500/30">
          <LogOut size={15} /> Sign Out
        </OutlineBtn>
      </Glass>
    </div>
  );
}


