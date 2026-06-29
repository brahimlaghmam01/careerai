import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Glass, cn, PrimaryBtn, OutlineBtn } from "../components/UI";

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

const SAMPLE = {
  fullName: "Jane Doe",
  title: "Frontend Developer",
  location: "Casablanca, Morocco",
  email: "jane@email.com",
  phone: "+212 6 12 34 56 78",
  linkedin: "linkedin.com/in/janedoe",
  website: "github.com/janedoe",
  summary:
    "Frontend developer with 4+ years building performant, accessible web applications. Passionate about UI/UX, TypeScript, and measurable impact.",
  coreSkills: ["React", "TypeScript", "UI/UX", "Accessibility", "Performance"],
  experience: [
    {
      role: "Senior Frontend Developer",
      companyName: "Acme Inc.",
      startDate: "2022",
      endDate: "Present",
      description:
        "Led design system adoption, improving UI consistency and reducing bugs. Built analytics dashboards and optimized rendering for faster load times.",
    },
    {
      role: "Frontend Developer",
      companyName: "Globex",
      startDate: "2019",
      endDate: "2022",
      description:
        "Developed responsive web features, improved accessibility, and collaborated with backend teams to ship end-to-end flows.",
    },
  ],
};

function clampTemplateName(name: string | null): TemplateName {
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
        bodyLayout: "card",
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

export default function TemplatePreviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const template = useMemo(
    () => clampTemplateName(searchParams.get("template")),
    [searchParams]
  );

  const cls = templateClass(template);

  return (
    <div className="p-5 md:p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4">
        <Glass className="p-6 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className={cn("h-2.5 w-2.5 rounded-full", cls.accent)} />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Template Preview</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Previewing <span className="font-semibold text-slate-700 dark:text-slate-200">{template}</span>. This is a sample layout.
          </p>
        </Glass>
      </div>

      <Glass className="p-6">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sample CV</div>
            <div className="text-sm text-slate-700 dark:text-slate-200 font-semibold">{SAMPLE.title}</div>
          </div>
          <div className="flex items-center gap-2">
            <OutlineBtn
              onClick={() => navigate(`/dashboard/templates`)}
              className="py-2 px-4 text-xs"
            >
              Back
            </OutlineBtn>
            <PrimaryBtn
              onClick={() => {
                const redirectTo = searchParams.get("redirect");
                if (redirectTo) {
                  navigate(
                    `${redirectTo}${redirectTo.includes("?") ? "&" : "?"}template=${encodeURIComponent(
                      template
                    )}`
                  );
                  return;
                }

                navigate(`/dashboard/cv?template=${encodeURIComponent(template)}`);
              }}
              className="py-2 px-4 text-xs"
            >
              Use this template
            </PrimaryBtn>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Header */}
          <div className={cn("p-6 text-white", cls.hero)}>
            <div className="max-w-3xl">
              <div className={cn("text-2xl font-extrabold leading-tight", template === "Minimal" ? "tracking-tight" : "")}>{SAMPLE.fullName}</div>
              <div className="text-sm opacity-90 mt-1">{SAMPLE.title}</div>

              {template === "Government" ? (
                <div className="mt-3 text-xs opacity-90">
                  <div className="font-semibold">{SAMPLE.location}</div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                    <span>{SAMPLE.email}</span>
                    <span>{SAMPLE.phone}</span>
                    <span>{SAMPLE.linkedin}</span>
                    <span>{SAMPLE.website}</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs opacity-90 mt-3 flex flex-wrap gap-x-3 gap-y-1">
                  <span>{SAMPLE.location}</span>
                  <span>{SAMPLE.email}</span>
                  <span>{SAMPLE.phone}</span>
                  <span>{SAMPLE.linkedin}</span>
                  <span>{SAMPLE.website}</span>
                </div>
              )}
            </div>
          </div>

          {/* Body */}
          <div className={cn("p-6", cls.sidebar)}>
            <div className="flex gap-6">
              {template === "Professional" || template === "Executive" || template === "Classic" ? (
                <div className="w-56 shrink-0">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Profile</div>
                  <p className="text-sm text-slate-700 dark:text-slate-200 mt-2 leading-relaxed">{SAMPLE.summary}</p>

                  <div className="mt-5">
                    <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Core Skills</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {SAMPLE.coreSkills.map((s) => (
                        <span
                          key={s}
                          className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              <div className={cn(template === "Professional" || template === "Executive" || template === "Classic" ? "flex-1" : "w-full")}> 
                {template === "Skills First" || template === "Data Analyst" ? (
                  <>
                    <div className="mb-4">
                      <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Core Skills</div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {SAMPLE.coreSkills.map((s) => (
                          <span
                            key={s}
                            className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                ) : null}

                <div className="mb-4">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Professional Summary</div>
                  <p className="text-sm text-slate-700 dark:text-slate-200 mt-2 leading-relaxed">{SAMPLE.summary}</p>
                </div>

                {template === "Skills First" || template === "Data Analyst" ? null : (
                  <div className="mb-4">
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Core Skills</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {SAMPLE.coreSkills.map((s) => (
                        <span
                          key={s}
                          className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Experience</div>
                  <div className="space-y-3 mt-3">
                    {SAMPLE.experience.map((e) => (
                      <div key={e.role} className="p-3 rounded-lg bg-white/70 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-baseline justify-between gap-4">
                          <div>
                            <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{e.role}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{e.companyName}</div>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {e.startDate} - {e.endDate}
                          </div>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-200 mt-2 leading-relaxed">{e.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Glass>
    </div>
  );
}

