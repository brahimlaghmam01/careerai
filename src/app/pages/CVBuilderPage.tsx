import { useEffect, useMemo, useState } from "react";
import { Sparkles, FileText, Save, Wand2 } from "lucide-react";
import { Glass, PrimaryBtn, OutlineBtn } from "../components/UI";
import api from "../lib/api";
import { useLocation } from "react-router-dom";

const TEMPLATES = [
  "Modern",
  "Professional",
  "Minimal",
  "Creative",
  "Executive",
  "Academic",
] as const;

export default function CVBuilderPage() {
  const location = useLocation();
  const templateFromQuery = new URLSearchParams(location.search).get("template");
  const normalizedTemplate =
    templateFromQuery && (TEMPLATES as readonly string[]).includes(templateFromQuery)
      ? templateFromQuery
      : "Professional";

  const [formData, setFormData] = useState({
    fullName: "",
    targetJob: "",

    email: "",
    phone: "",
    location: "",
    linkedin: "",
    website: "",

    // Structured fields
    experience: [] as Array<{
      role: string;
      startDate: string;
      endDate: string;
      companyName: string;
      description: string;
    }>,
    education: [] as Array<{
      startDate: string;
      endDate: string;
      school: string;
      filiere: string;
      description: string;
    }>,
    projects: [] as Array<{
      projectName: string;
      status: string;
      description: string;
    }>,

    achievements: "",

    skills: "",
    certifications: "",

    // Backward-compatible text fields (derived from structured inputs)
    experienceText: "",
    educationText: "",
    projectsText: "",

    template: normalizedTemplate,
  });

  useEffect(() => {
    setFormData((prev) => ({ ...prev, template: normalizedTemplate }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedTemplate]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [generationCount, setGenerationCount] = useState(0);

  const parsedContactPreview = useMemo(() => {
    if (!result?.contact) return null;
    return [
      result.contact.email,
      result.contact.phone,
      result.contact.location,
      result.contact.linkedin,
      result.contact.website,
    ]
      .filter(Boolean)
      .join(" • ");
  }, [result]);

  const buildLegacyTexts = (data: typeof formData) => {
    const experienceText = data.experience
      .map((e) => {
        const dates = [e.startDate, e.endDate].filter(Boolean).join(" - ");
        const header = [e.role, e.companyName].filter(Boolean).join(" • ");
        return `${header}${dates ? `\n${dates}` : ""}${e.description ? `\n${e.description}` : ""}`;
      })
      .join("\n\n");

    const educationText = data.education
      .map((ed) => {
        const dates = [ed.startDate, ed.endDate].filter(Boolean).join(" - ");
        const header = [ed.school, ed.filiere].filter(Boolean).join(" • ");
        return `${header}${dates ? `\n${dates}` : ""}${ed.description ? `\n${ed.description}` : ""}`;
      })
      .join("\n\n");

    const projectsText = data.projects
      .map((p) => {
        const header = [p.projectName, p.status].filter(Boolean).join(" • ");
        return `${header}${p.description ? `\n${p.description}` : ""}`;
      })
      .join("\n\n");

    return { experienceText, educationText, projectsText };
  };

  const generateCV = async () => {
    if (!formData.fullName.trim() || !formData.targetJob.trim()) {
      alert("Please enter your Full Name and Target Job Title.");
      return;
    }

    const { experienceText, educationText, projectsText } = buildLegacyTexts(formData);

    setLoading(true);
    try {
      const payload = {
        ...formData,
        experienceText,
        educationText,
        projectsText,
      };

      const res = await api.post("/generate/cv", {
        prompt: "Generate CV",
        data: payload,
      });

      const parsed = JSON.parse(res.data.response);
      setResult(parsed);
      setGenerationCount((c) => c + 1);
    } catch (err) {
      console.error(err);
      alert("Failed to generate CV. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveCV = async () => {
    try {
      const { experienceText, educationText, projectsText } = buildLegacyTexts(formData);

      const input = {
        ...formData,
        experienceText,
        educationText,
        projectsText,
      };

      await api.post("/documents", {
        type: "cv",
        name: `${formData.targetJob || "Generated"} CV - ${formData.fullName}`,
        content: { ...result, template: formData.template, input },
        ats_score: result?.ats_score ?? null,
      });

      alert("CV Saved to your Dashboard!");
    } catch (err) {
      console.error(err);
      alert("Failed to save CV.");
    }
  };

  const steps = useMemo(
    () => [
      { id: 0, label: "Contact & Target" },
      { id: 1, label: "Experience" },
      { id: 2, label: "Education" },
      { id: 3, label: "Projects" },
      { id: 4, label: "Skills & Certifications" },
    ],
    []
  );

  const [activeStep, setActiveStep] = useState(0);

  const canGoNext = useMemo(() => {
    if (activeStep === 0) {
      return Boolean(formData.fullName.trim() && formData.targetJob.trim());
    }
    return true;
  }, [activeStep, formData.fullName, formData.targetJob]);

  const canGoPrev = activeStep > 0;
  const goPrev = () => canGoPrev && setActiveStep((s) => Math.max(0, s - 1));
  const goNext = () =>
    canGoNext &&
    setActiveStep((s) => Math.min(steps.length - 1, s + 1));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Editor Side */}
        <div className="flex-1 space-y-6">
          <Glass className="p-6">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <FileText className="text-blue-500" size={20} />
              CV Details
            </h2>

            <div className="space-y-4">
              {/* Multi-step form UX */}
              <div className="mb-4">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Step {activeStep + 1} of {steps.length}
                  </h2>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{steps[activeStep]?.label}</div>
                </div>
                <div className="mt-3 h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full transition-[width] duration-300"
                    style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                  />
                </div>
              </div>

              {activeStep === 0 ? (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Full Name</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-[12px] px-4 py-3 text-sm text-slate-700 dark:text-slate-200"
                      placeholder="e.g. Jane Doe"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Target Job Title</label>
                    <input
                      type="text"
                      value={formData.targetJob}
                      onChange={(e) => setFormData({ ...formData, targetJob: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-[12px] px-4 py-3 text-sm text-slate-700 dark:text-slate-200"
                      placeholder="e.g. Frontend Developer"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Email</label>
                      <input
                        type="text"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-[12px] px-4 py-3 text-sm text-slate-700 dark:text-slate-200"
                        placeholder="e.g. jane@email.com"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Phone</label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-[12px] px-4 py-3 text-sm text-slate-700 dark:text-slate-200"
                        placeholder="e.g. +212 6 12 34 56 78"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-[12px] px-4 py-3 text-sm text-slate-700 dark:text-slate-200"
                      placeholder="e.g. Casablanca, Morocco"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">LinkedIn</label>
                      <input
                        type="text"
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-[12px] px-4 py-3 text-sm text-slate-700 dark:text-slate-200"
                        placeholder="e.g. linkedin.com/in/janedoe"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Website / Portfolio</label>
                      <input
                        type="text"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-[12px] px-4 py-3 text-sm text-slate-700 dark:text-slate-200"
                        placeholder="e.g. https://github.com/janedoe"
                      />
                    </div>
                  </div>
                </>
              ) : null}

              {activeStep === 1 ? (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Experience</label>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            experience: [
                              ...prev.experience,
                              { role: "", startDate: "", endDate: "", companyName: "", description: "" },
                            ],
                          }))
                        }
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        + Add
                      </button>
                    </div>

                    {formData.experience.length ? (
                      <div className="space-y-4">
                        {formData.experience.map((item, idx) => (
                          <div key={idx} className="p-4 rounded-[12px] border border-slate-200 dark:border-slate-700/60 bg-white/40 dark:bg-slate-800/20">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Role</label>
                                <input
                                  type="text"
                                  value={item.role}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    setFormData((prev) => {
                                      const next = [...prev.experience];
                                      next[idx] = { ...next[idx], role: v };
                                      return { ...prev, experience: next };
                                    });
                                  }}
                                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-[12px] px-4 py-3 text-sm text-slate-700 dark:text-slate-200"
                                  placeholder="e.g. Senior Frontend Developer"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Company Name</label>
                                <input
                                  type="text"
                                  value={item.companyName}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    setFormData((prev) => {
                                      const next = [...prev.experience];
                                      next[idx] = { ...next[idx], companyName: v };
                                      return { ...prev, experience: next };
                                    });
                                  }}
                                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-[12px] px-4 py-3 text-sm text-slate-700 dark:text-slate-200"
                                  placeholder="e.g. Acme Inc."
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Start Date</label>
                                <input
                                  type="text"
                                  value={item.startDate}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    setFormData((prev) => {
                                      const next = [...prev.experience];
                                      next[idx] = { ...next[idx], startDate: v };
                                      return { ...prev, experience: next };
                                    });
                                  }}
                                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-[12px] px-4 py-3 text-sm text-slate-700 dark:text-slate-200"
                                  placeholder="e.g. 2019-01"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">End Date</label>
                                <input
                                  type="text"
                                  value={item.endDate}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    setFormData((prev) => {
                                      const next = [...prev.experience];
                                      next[idx] = { ...next[idx], endDate: v };
                                      return { ...prev, experience: next };
                                    });
                                  }}
                                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-[12px] px-4 py-3 text-sm text-slate-700 dark:text-slate-200"
                                  placeholder="e.g. 2023-12 or Present"
                                />
                              </div>
                            </div>

                            <div className="mt-4">
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Description</label>
                              <textarea
                                rows={3}
                                value={item.description}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setFormData((prev) => {
                                    const next = [...prev.experience];
                                    next[idx] = { ...next[idx], description: v };
                                    return { ...prev, experience: next };
                                  });
                                }}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-[12px] px-4 py-3 text-sm text-slate-700 dark:text-slate-200"
                                placeholder="What did you do? Achievements, responsibilities, impact..."
                              />
                            </div>

                            <div className="flex justify-end mt-3">
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    experience: prev.experience.filter((_, i) => i !== idx),
                                  }))
                                }
                                className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400">Add at least one experience entry.</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Top Achievements (optional)</label>
                    <textarea
                      rows={3}
                      value={formData.achievements}
                      onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-[12px] px-4 py-3 text-sm text-slate-700 dark:text-slate-200"
                      placeholder="e.g. Reduced load time by 30%, Led migration to X, Increased conversions by 15%..."
                    />
                  </div>
                </>
              ) : null}

              {activeStep === 2 ? (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Education</label>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            education: [
                              ...prev.education,
                              { startDate: "", endDate: "", school: "", filiere: "", description: "" },
                            ],
                          }))
                        }
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        + Add
                      </button>
                    </div>

                    {formData.education.length ? (
                      <div className="space-y-4">
                        {formData.education.map((item, idx) => (
                          <div key={idx} className="p-4 rounded-[12px] border border-slate-200 dark:border-slate-700/60 bg-white/40 dark:bg-slate-800/20">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">School</label>
                                <input
                                  type="text"
                                  value={item.school}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    setFormData((prev) => {
                                      const next = [...prev.education];
                                      next[idx] = { ...next[idx], school: v };
                                      return { ...prev, education: next };
                                    });
                                  }}
                                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-[12px] px-4 py-3 text-sm text-slate-700 dark:text-slate-200"
                                  placeholder="e.g. University of X"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Filiere</label>
                                <input
                                  type="text"
                                  value={item.filiere}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    setFormData((prev) => {
                                      const next = [...prev.education];
                                      next[idx] = { ...next[idx], filiere: v };
                                      return { ...prev, education: next };
                                    });
                                  }}
                                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-[12px] px-4 py-3 text-sm text-slate-700 dark:text-slate-200"
                                  placeholder="e.g. Computer Science"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Start Date</label>
                                <input
                                  type="text"
                                  value={item.startDate}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    setFormData((prev) => {
                                      const next = [...prev.education];
                                      next[idx] = { ...next[idx], startDate: v };
                                      return { ...prev, education: next };
                                    });
                                  }}
                                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-[12px] px-4 py-3 text-sm text-slate-700 dark:text-slate-200"
                                  placeholder="e.g. 2018-09"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">End Date</label>
                                <input
                                  type="text"
                                  value={item.endDate}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    setFormData((prev) => {
                                      const next = [...prev.education];
                                      next[idx] = { ...next[idx], endDate: v };
                                      return { ...prev, education: next };
                                    });
                                  }}
                                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-[12px] px-4 py-3 text-sm text-slate-700 dark:text-slate-200"
                                  placeholder="e.g. 2022-06"
                                />
                              </div>
                            </div>

                            <div className="mt-4">
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Description (optional)</label>
                              <textarea
                                rows={2}
                                value={item.description}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setFormData((prev) => {
                                    const next = [...prev.education];
                                    next[idx] = { ...next[idx], description: v };
                                    return { ...prev, education: next };
                                  });
                                }}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-[12px] px-4 py-3 text-sm text-slate-700 dark:text-slate-200"
                                placeholder="Optional: highlights, achievements..."
                              />
                            </div>

                            <div className="flex justify-end mt-3">
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    education: prev.education.filter((_, i) => i !== idx),
                                  }))
                                }
                                className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400">Add at least one education entry.</p>
                    )}
                  </div>
                </>
              ) : null}

              {activeStep === 3 ? (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Projects</label>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            projects: [
                              ...prev.projects,
                              { projectName: "", status: "prototype", description: "" },
                            ],
                          }))
                        }
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        + Add
                      </button>
                    </div>

                    {formData.projects.length ? (
                      <div className="space-y-4">
                        {formData.projects.map((item, idx) => (
                          <div key={idx} className="p-4 rounded-[12px] border border-slate-200 dark:border-slate-700/60 bg-white/40 dark:bg-slate-800/20">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Project Name</label>
                                <input
                                  type="text"
                                  value={item.projectName}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    setFormData((prev) => {
                                      const next = [...prev.projects];
                                      next[idx] = { ...next[idx], projectName: v };
                                      return { ...prev, projects: next };
                                    });
                                  }}
                                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-[12px] px-4 py-3 text-sm text-slate-700 dark:text-slate-200"
                                  placeholder="e.g. JobScraper Dashboard"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Status</label>
                                <select
                                  value={item.status}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    setFormData((prev) => {
                                      const next = [...prev.projects];
                                      next[idx] = { ...next[idx], status: v };
                                      return { ...prev, projects: next };
                                    });
                                  }}
                                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-[12px] px-4 py-3 text-sm text-slate-700 dark:text-slate-200"
                                >
                                  <option value="prototype">prototype</option>
                                  <option value="MVP">MVP</option>
                                  <option value="production">production</option>
                                </select>
                              </div>
                            </div>

                            <div className="mt-4">
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Description</label>
                              <textarea
                                rows={2}
                                value={item.description}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setFormData((prev) => {
                                    const next = [...prev.projects];
                                    next[idx] = { ...next[idx], description: v };
                                    return { ...prev, projects: next };
                                  });
                                }}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-[12px] px-4 py-3 text-sm text-slate-700 dark:text-slate-200"
                                placeholder="What problem, your role, stack, results..."
                              />
                            </div>

                            <div className="flex justify-end mt-3">
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    projects: prev.projects.filter((_, i) => i !== idx),
                                  }))
                                }
                                className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400">Add at least one project entry.</p>
                    )}
                  </div>
                </>
              ) : null}

              {activeStep === 4 ? (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Skills</label>
                    <input
                      type="text"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-[12px] px-4 py-3 text-sm text-slate-700 dark:text-slate-200"
                      placeholder="e.g. React, TypeScript, Node.js"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Certifications (optional)</label>
                    <textarea
                      rows={3}
                      value={formData.certifications}
                      onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-[12px] px-4 py-3 text-sm text-slate-700 dark:text-slate-200"
                      placeholder="e.g. AWS Certified Cloud Practitioner (2024)"
                    />
                  </div>

                  <PrimaryBtn onClick={generateCV} className="w-full py-3.5 mt-2">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Sparkles className="animate-pulse" size={16} /> Optimizing with AI...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Wand2 size={16} /> Generate Optimized CV
                      </span>
                    )}
                  </PrimaryBtn>
                </>
              ) : null}

              {/* Navigation buttons */}
              {activeStep !== 4 ? (
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={!canGoPrev}
                    className="text-xs font-semibold px-4 py-2 rounded-[12px] border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 disabled:opacity-50"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canGoNext}
                    className="text-xs font-semibold px-4 py-2 rounded-[12px] bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              ) : null}

              {activeStep !== 4 ? null : null}

              {/* Generate button is shown in Step 4 to avoid premature submit */}
              {activeStep === 0 || activeStep === 1 || activeStep === 2 || activeStep === 3 ? (
                <div className="hidden" />
              ) : null}
            </div>
          </Glass>
        </div>

        {/* Preview Side */}
        <div className="flex-1">
          <Glass className="p-6 h-full flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100 dark:border-slate-800/60">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="text-violet-500" size={20} />
                AI Preview
              </h2>
              {result && (
                <OutlineBtn onClick={saveCV} className="py-2 px-4 text-xs h-auto">
                  <Save size={14} /> Save to Dashboard
                </OutlineBtn>
              )}
            </div>

            {result ? (
              <div className="flex-1 overflow-y-auto space-y-6">
                <div className="text-center pb-6 border-b border-slate-100 dark:border-slate-800/60">
                  <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">{result.fullName}</h1>
                  <p className="text-[#2563EB] font-medium">{formData.targetJob}</p>

                  <div className="mt-2 inline-flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Generated preview updated ({generationCount || 0})
                  </div>

                  {parsedContactPreview ? (
                    <div className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {parsedContactPreview}
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center gap-3">
                  {typeof result?.ats_score === "number" ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20">
                      <span className="text-xs font-bold text-violet-700 dark:text-violet-200">ATS</span>
                      <span className="text-xs text-violet-700 dark:text-violet-200 font-semibold">{result.ats_score}/100</span>
                    </div>
                  ) : null}
                  {result?.ats_reasons?.length ? (
                    <div className="text-xs text-slate-500 dark:text-slate-400">{result.ats_reasons[0]}</div>
                  ) : null}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Professional Summary</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-blue-50/50 dark:bg-blue-500/5 p-4 rounded-xl border border-blue-100 dark:border-blue-500/10">
                    {result.summary}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Core Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {(result.coreSkills || [])?.length
                      ? result.coreSkills.map((s: string, i: number) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium"
                          >
                            {s}
                          </span>
                        ))
                      : String(result.skills || "")
                          .replace("Optimized Skills: ", "")
                          .split(",")
                          .map((s: string, i: number) => (
                            <span
                              key={i}
                              className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium"
                            >
                              {s.trim()}
                            </span>
                          ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Experience</h3>
                  <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{result.experience}</div>
                </div>

                {result.projects?.length ? (
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Projects</h3>
                    <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {result.projects.join("\n")}
                    </div>
                  </div>
                ) : null}

                {result.achievements ? (
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Top Achievements</h3>
                    <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{result.achievements}</div>
                  </div>
                ) : null}

                {result.education ? (
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Education</h3>
                    <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{result.education}</div>
                  </div>
                ) : null}

                {result.certifications ? (
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Certifications</h3>
                    <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{result.certifications}</div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <FileText size={48} className="mb-4 text-slate-300 dark:text-slate-700" />
                <p>Fill out the details and click generate</p>
                <p className="text-xs mt-1">Our AI will optimize it for ATS tracking.</p>
              </div>
            )}
          </Glass>
        </div>
      </div>
    </div>
  );
}

