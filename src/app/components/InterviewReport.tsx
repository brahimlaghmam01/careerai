import { useState } from "react";
import {
    Award, TrendingUp, Target, BookOpen, Lightbulb,
    CheckCircle2, AlertCircle, ArrowRight, Download, RotateCcw,
    MessageSquare, Code, UserCheck
} from "lucide-react";
import { Glass, cn, PrimaryBtn, OutlineBtn } from "./UI";
import type { InterviewReport as Report } from "../lib/interviewUtils";

interface InterviewReportProps {
    report: Report;
    onRetry: () => void;
    onDownload?: () => void;
}

function RadarChart({ scores }: { scores: { label: string; value: number }[] }) {
    const size = 220;
    const center = size / 2;
    const radius = 80;
    const levels = 4;

    const angleStep = (2 * Math.PI) / scores.length;
    const getPoint = (index: number, value: number) => {
        const angle = angleStep * index - Math.PI / 2;
        const r = (value / 100) * radius;
        return {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle),
        };
    };

    const gridPoints = Array.from({ length: levels }, (_, level) => {
        const r = ((level + 1) / levels) * radius;
        return scores.map((_, i) => {
            const angle = angleStep * i - Math.PI / 2;
            return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
        });
    });

    const dataPoints = scores.map((s, i) => getPoint(i, s.value));
    const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
            {/* Grid */}
            {gridPoints.map((points, level) => (
                <polygon
                    key={level}
                    points={points.map((p) => `${p.x},${p.y}`).join(" ")}
                    fill="none"
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-700"
                    strokeWidth={1}
                />
            ))}
            {/* Axes */}
            {scores.map((_, i) => {
                const p = getPoint(i, 100);
                return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth={1} />;
            })}
            {/* Data */}
            <polygon points={dataPoints.map((p) => `${p.x},${p.y}`).join(" ")} fill="rgba(37,99,235,0.15)" stroke="#2563EB" strokeWidth={2} />
            {dataPoints.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={4} fill="#2563EB" className="drop-shadow-sm" />
            ))}
            {/* Labels */}
            {scores.map((s, i) => {
                const p = getPoint(i, 120);
                return (
                    <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" className="fill-slate-500 dark:fill-slate-400 text-[10px] font-medium">
                        {s.label}
                    </text>
                );
            })}
        </svg>
    );
}

function ScoreCard({ label, score, icon: Icon, color }: { label: string; score: number; icon: any; color: string }) {
    const getGrade = (s: number) => {
        if (s >= 85) return { letter: "A", text: "Excellent" };
        if (s >= 70) return { letter: "B", text: "Good" };
        if (s >= 55) return { letter: "C", text: "Average" };
        return { letter: "D", text: "Needs Work" };
    };
    const grade = getGrade(score);

    return (
        <Glass className="p-4 flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", color)}>
                <Icon size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
                    <span className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded-full",
                        grade.letter === "A" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                            grade.letter === "B" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                                grade.letter === "C" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                                    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    )}>
                        {grade.letter}
                    </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                            className={cn("h-full rounded-full transition-all duration-1000", score >= 70 ? "bg-emerald-500" : score >= 55 ? "bg-amber-500" : "bg-red-500")}
                            style={{ width: `${score}%` }}
                        />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-8 text-right">{score}%</span>
                </div>
            </div>
        </Glass>
    );
}

export default function InterviewReportComponent({ report, onRetry, onDownload }: InterviewReportProps) {
    const [activeTab, setActiveTab] = useState<"overview" | "feedback" | "resources">("overview");

    const scores = [
        { label: "Communication", score: report.communication, icon: MessageSquare, color: "bg-blue-500" },
        { label: "Technical", score: report.technicalSkills, icon: Code, color: "bg-violet-500" },
        { label: "Confidence", score: report.confidence, icon: Award, color: "bg-emerald-500" },
        { label: "Problem Solving", score: report.problemSolving, icon: Target, color: "bg-orange-500" },
        { label: "English", score: report.english, icon: BookOpen, color: "bg-cyan-500" },
        { label: "Body Language", score: report.bodyLanguage, icon: UserCheck, color: "bg-pink-500" },
    ];

    const radarData = [
        { label: "Comm.", value: report.communication },
        { label: "Tech.", value: report.technicalSkills },
        { label: "Conf.", value: report.confidence },
        { label: "Prob.", value: report.problemSolving },
        { label: "Eng.", value: report.english },
        { label: "Body", value: report.bodyLanguage },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <Glass className="p-6 bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white border-0">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Award size={20} />
                            <h2 className="text-xl font-bold">Interview Complete</h2>
                        </div>
                        <p className="text-blue-100/90 text-sm">
                            {report.answeredQuestions} of {report.totalQuestions} questions answered · {Math.floor(report.duration / 60)}m {report.duration % 60}s duration
                        </p>
                    </div>
                    <div className="text-center">
                        <div className={cn(
                            "w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold border-4",
                            report.overall >= 70 ? "border-emerald-400 bg-emerald-500/20" :
                                report.overall >= 55 ? "border-amber-400 bg-amber-500/20" :
                                    "border-red-400 bg-red-500/20"
                        )}>
                            {report.overall}%
                        </div>
                        <p className="text-xs text-blue-100/80 mt-1">Overall</p>
                    </div>
                </div>
            </Glass>

            {/* Tabs */}
            <div className="flex gap-2">
                {[
                    { id: "overview" as const, label: "Overview", icon: TrendingUp },
                    { id: "feedback" as const, label: "Feedback", icon: Lightbulb },
                    { id: "resources" as const, label: "Resources", icon: BookOpen },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                            activeTab === tab.id
                                ? "bg-[#2563EB] text-white shadow-lg shadow-blue-500/25"
                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700"
                        )}
                    >
                        <tab.icon size={15} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
                <div className="grid md:grid-cols-2 gap-6">
                    <Glass className="p-6">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Performance Radar</h3>
                        <RadarChart scores={radarData} />
                    </Glass>

                    <div className="space-y-3">
                        {scores.map((s) => (
                            <ScoreCard key={s.label} label={s.label} score={s.score} icon={s.icon} color={s.color} />
                        ))}
                    </div>
                </div>
            )}

            {/* Feedback Tab */}
            {activeTab === "feedback" && (
                <div className="space-y-6">
                    {/* Strengths */}
                    <Glass className="p-6">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                            <CheckCircle2 size={18} className="text-emerald-500" />
                            Strengths
                        </h3>
                        <ul className="space-y-3">
                            {report.strengths.map((s, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                                    <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </Glass>

                    {/* Weaknesses */}
                    <Glass className="p-6">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                            <AlertCircle size={18} className="text-amber-500" />
                            Areas for Improvement
                        </h3>
                        <ul className="space-y-3">
                            {report.weaknesses.map((w, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                                    <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 mt-0.5">
                                        <AlertCircle size={12} className="text-amber-600 dark:text-amber-400" />
                                    </div>
                                    {w}
                                </li>
                            ))}
                        </ul>
                    </Glass>

                    {/* Detailed Feedback */}
                    <Glass className="p-6">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                            <Lightbulb size={18} className="text-blue-500" />
                            Detailed Feedback
                        </h3>
                        <div className="space-y-4">
                            {report.feedback.map((f, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                                        f.score >= 70 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                                            f.score >= 55 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                                                "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                    )}>
                                        {f.score}%
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{f.category}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{f.comment}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Glass>

                    {/* Improvement Suggestions */}
                    <Glass className="p-6">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                            <TrendingUp size={18} className="text-violet-500" />
                            Improvement Suggestions
                        </h3>
                        <ul className="space-y-2">
                            {report.improvements.map((imp, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                                    <ArrowRight size={14} className="text-violet-400 shrink-0 mt-0.5" />
                                    {imp}
                                </li>
                            ))}
                        </ul>
                    </Glass>
                </div>
            )}

            {/* Resources Tab */}
            {activeTab === "resources" && (
                <Glass className="p-6">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                        <BookOpen size={18} className="text-cyan-500" />
                        Recommended Learning Resources
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                        {report.resources.map((r, i) => (
                            <a
                                key={i}
                                href={r.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                    {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{r.title}</p>
                                    <p className="text-xs text-slate-400 truncate">{r.url}</p>
                                </div>
                                <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                            </a>
                        ))}
                    </div>
                </Glass>
            )}

            {/* Actions */}
            <div className="flex items-center justify-center gap-3 pt-2">
                <OutlineBtn onClick={onRetry} className="py-2.5 px-5">
                    <RotateCcw size={14} />
                    Practice Again
                </OutlineBtn>
                {onDownload && (
                    <PrimaryBtn onClick={onDownload} className="py-2.5 px-5">
                        <Download size={14} />
                        Download Report
                    </PrimaryBtn>
                )}
            </div>
        </div>
    );
}

