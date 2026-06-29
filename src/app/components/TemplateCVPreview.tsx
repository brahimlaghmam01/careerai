import { cn } from "./UI";

const ALL_TEMPLATES = [
  "Modern",
  "Professional",
  "Minimal",
  "Creative",
  "Executive",
  "Academic",
  "Classic",
  "Skills First",
  "Data Analyst",
  "Frontend",
  "Product",
  "Government",
] as const;

type TemplateName = (typeof ALL_TEMPLATES)[number];

export type CVExperience = {
  role: string;
  startDate: string;
  endDate: string;
  companyName: string;
  description: string;
};

export type CVEducation = {
  startDate: string;
  endDate: string;
  school: string;
  filiere: string;
  description: string;
};

export type CVProject = {
  projectName: string;
  status: string;
  description: string;
};

export type CVInputLike = {
  template: string;
  fullName: string;
  targetJob: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  summary?: string;
  coreSkills?: string[];
  achievements?: string;
  skills?: string;
  experience: CVExperience[];
  education: CVEducation[];
  projects: CVProject[];
  certifications?: string;
};

function clampTemplateName(name: string | null | undefined): TemplateName {
  const normalized = name ?? "Professional";
  return (ALL_TEMPLATES as readonly string[]).includes(normalized)
    ? (normalized as TemplateName)
    : "Professional";
}

function templateClass(template: TemplateName) {
  switch (template) {
    case "Modern":
      return {
        hero: "bg-gradient-to-r from-[#2563EB] to-[#06B6D4]",
        accent: "text-[#2563EB]",
        sidebar: "bg-[#F8FAFC] dark:bg-[#0F172A]",
      };
    case "Professional":
      return {
        hero: "bg-gradient-to-r from-[#7C3AED] to-[#2563EB]",
        accent: "text-[#7C3AED]",
        sidebar: "bg-[#F8FAFC] dark:bg-[#0F172A]",
      };
    case "Minimal":
      return {
        hero: "bg-slate-800",
        accent: "text-slate-800",
        sidebar: "bg-white dark:bg-[#0F172A]",
      };
    case "Creative":
      return {
        hero: "bg-gradient-to-r from-[#EC4899] to-[#7C3AED]",
        accent: "text-[#EC4899]",
        sidebar: "bg-[#0B1220]",
      };
    case "Executive":
      return {
        hero: "bg-gradient-to-r from-[#0F766E] to-[#0891B2]",
        accent: "text-[#0F766E]",
        sidebar: "bg-slate-50 dark:bg-[#0F172A]",
      };
    case "Academic":
      return {
        hero: "bg-gradient-to-r from-[#B45309] to-[#92400E]",
        accent: "text-[#B45309]",
        sidebar: "bg-slate-50 dark:bg-[#0F172A]",
      };
    case "Classic":
      return {
        hero: "bg-gradient-to-r from-[#1D4ED8] to-[#4F46E5]",
        accent: "text-[#1D4ED8]",
        sidebar: "bg-slate-50 dark:bg-[#0F172A]",
      };
    case "Skills First":
      return {
        hero: "bg-gradient-to-r from-[#10B981] to-[#3B82F6]",
        accent: "text-[#10B981]",
        sidebar: "bg-slate-50 dark:bg-[#0F172A]",
      };
    case "Data Analyst":
      return {
        hero: "bg-gradient-to-r from-[#F59E0B] to-[#EF4444]",
        accent: "text-[#F59E0B]",
        sidebar: "bg-slate-50 dark:bg-[#0F172A]",
      };
    case "Frontend":
      return {
        hero: "bg-gradient-to-r from-[#7C3AED] to-[#2563EB]",
        accent: "text-[#7C3AED]",
        sidebar: "bg-slate-50 dark:bg-[#0F172A]",
      };
    case "Product":
      return {
        hero: "bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6]",
        accent: "text-[#06B6D4]",
        sidebar: "bg-slate-50 dark:bg-[#0F172A]",
      };
    case "Government":
      return {
        hero: "bg-gradient-to-r from-[#0F172A] to-[#475569]",
        accent: "text-[#0F172A]",
        sidebar: "bg-slate-50 dark:bg-[#0F172A]",
      };
    default:
      return {
        hero: "bg-gradient-to-r from-[#2563EB] to-[#06B6D4]",
        accent: "text-[#2563EB]",
        sidebar: "bg-[#F8FAFC] dark:bg-[#0F172A]",
      };
  }
}

function splitSkills(skills?: string) {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills;
  return String(skills)
    .replace("Optimized Skills: ", "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function TemplateCVPreview({ data }: { data: CVInputLike }) {
  const template = clampTemplateName(data.template);
  const cls = templateClass(template);

  const skillsFromResult = Array.isArray(data.coreSkills)
    ? data.coreSkills
    : splitSkills(data.skills);

  const showLeftProfile =
    template === "Professional" ||
    template === "Executive" ||
    template === "Classic";

  const showSkillsFirst = template === "Skills First" || template === "Data Analyst";

  const contactItems = [
    data.location,
    data.email,
    data.phone,
    data.linkedin,
    data.website,
  ].filter(Boolean);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className={cn("p-6 text-white", cls.hero)}>
        <div className="max-w-3xl">
          <div
            className={cn(
              "text-2xl font-extrabold leading-tight",
              template === "Minimal" ? "tracking-tight" : ""
            )}
          >
            {data.fullName || "Your Name"}
          </div>
          <div className="text-sm opacity-90 mt-1">{data.targetJob || "Target Job Title"}</div>

          <div className="text-xs opacity-90 mt-3 flex flex-wrap gap-x-3 gap-y-1">
            {contactItems.map((c, i) => (
              <span key={`${c}-${i}`}>{c}</span>
            ))}
          </div>
        </div>
      </div>

      <div className={cn("p-6", cls.sidebar)}>
        <div className="flex gap-6">
          {showLeftProfile ? (
            <div className="w-56 shrink-0">
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Profile</div>
              <p className="text-sm text-slate-700 dark:text-slate-200 mt-2 leading-relaxed">
                {data.summary ||
                  data.achievements ||
                  "Write a brief summary of your experience and what you're looking for."}
              </p>

              {skillsFromResult.length ? (
                <div className="mt-5">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Core Skills</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skillsFromResult.map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className={cn(showLeftProfile ? "flex-1" : "w-full")}>
            {showSkillsFirst && skillsFromResult.length ? (
              <div className="mb-4">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Core Skills</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skillsFromResult.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className={cn(showSkillsFirst ? "" : "mb-4")}> 
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Professional Summary</div>
              <p className="text-sm text-slate-700 dark:text-slate-200 mt-2 leading-relaxed">
                {data.summary || "Your professional summary will appear here."}
              </p>
            </div>

            {!showSkillsFirst && skillsFromResult.length ? (
              <div className="mb-4">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Core Skills</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skillsFromResult.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {data.experience?.length ? (
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Experience</div>
                <div className="space-y-3 mt-3">
                  {data.experience.map((e, idx) => (
                    <div
                      key={`${e.role}-${idx}`}
                      className="p-3 rounded-lg bg-white/70 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800"
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <div>
                          <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{e.role || "Role"}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{e.companyName || "Company"}</div>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {[e.startDate, e.endDate].filter(Boolean).join(" - ")}
                        </div>
                      </div>
                      {e.description ? (
                        <p className="text-sm text-slate-700 dark:text-slate-200 mt-2 leading-relaxed">{e.description}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {data.projects?.length ? (
              <div className="mt-5">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Projects</div>
                <div className="space-y-3 mt-3">
                  {data.projects.map((p, idx) => (
                    <div
                      key={`${p.projectName}-${idx}`}
                      className="p-3 rounded-lg bg-white/70 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800"
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <div>
                          <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{p.projectName || "Project"}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{p.status || "Status"}</div>
                        </div>
                      </div>
                      {p.description ? (
                        <p className="text-sm text-slate-700 dark:text-slate-200 mt-2 leading-relaxed">{p.description}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {data.education?.length ? (
              <div className="mt-5">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Education</div>
                <div className="space-y-3 mt-3">
                  {data.education.map((ed, idx) => (
                    <div
                      key={`${ed.school}-${idx}`}
                      className="p-3 rounded-lg bg-white/70 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800"
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <div>
                          <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{ed.school || "School"}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{ed.filiere || "Program"}</div>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {[ed.startDate, ed.endDate].filter(Boolean).join(" - ")}
                        </div>
                      </div>
                      {ed.description ? (
                        <p className="text-sm text-slate-700 dark:text-slate-200 mt-2 leading-relaxed">{ed.description}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {data.certifications ? (
              <div className="mt-5">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Certifications</div>
                <p className="text-sm text-slate-700 dark:text-slate-200 mt-2 leading-relaxed whitespace-pre-wrap">
                  {data.certifications}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

