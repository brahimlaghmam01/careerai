import { useState, useRef, useCallback, useEffect } from "react";
import {
  MessageSquare, Upload, FileText, Target, Sparkles, Play,
  Mic, MicOff, Clock, ChevronRight, CheckCircle2, AlertCircle,
  Loader2, Brain, BookOpen, Briefcase, Lightbulb, History, User
} from "lucide-react";
import { Glass, cn, PrimaryBtn, OutlineBtn } from "../components/UI";
import AIVideoCall from "../components/AIVideoCall";
import InterviewReportComponent from "../components/InterviewReport";
import {
  INTERVIEW_TYPES, generateReport, type InterviewReport
} from "../lib/interviewUtils";
import interviewService, { type InterviewSession } from "../lib/interviewService";

type Step = "setup" | "interview" | "report";

const AI_RECRUITERS = [
  { name: "Sarah Mitchell", avatar: "👩‍💼", color: "from-blue-500 to-cyan-500", title: "Senior HR Recruiter" },
  { name: "Dr. James Chen", avatar: "👨‍🔬", color: "from-violet-500 to-purple-500", title: "Technical Interviewer" },
  { name: "Alex Rivera", avatar: "🧑‍💻", color: "from-emerald-500 to-teal-500", title: "Engineering Manager" },
  { name: "Maria Santos", avatar: "👩‍🏫", color: "from-orange-500 to-red-500", title: "Behavioral Coach" },
];

export default function InterviewPrepPage() {
  const [step, setStep] = useState<Step>("setup");
  const [interviewType, setInterviewType] = useState("behavioral");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ question: string; answer: string; duration: number }[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [aiMessage, setAiMessage] = useState("");
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [showTips, setShowTips] = useState(true);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobFile, setJobFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [previousSessions, setPreviousSessions] = useState<InterviewSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const jobInputRef = useRef<HTMLInputElement>(null);

  const currentRecruiter = AI_RECRUITERS[INTERVIEW_TYPES.findIndex((t) => t.id === interviewType) % AI_RECRUITERS.length];

  // Load user profile on mount
  useEffect(() => {
    loadUserProfile();
    loadInterviewHistory();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await interviewService.getUserProfile();
      setUserName(profile.name.split(" ")[0]);
      if (profile.resume_text) setResumeText(profile.resume_text);
      if (profile.skills?.length > 0) setSkills(profile.skills.join(", "));
      if (profile.experience_years) setExperience(profile.experience_years);
    } catch (err) {
      // Profile load is optional - user can type manually
      console.log("Could not load profile, user can enter manually");
    }
  };

  const loadInterviewHistory = async () => {
    try {
      const sessions = await interviewService.getUserSessions();
      setPreviousSessions(sessions.filter((s) => s.status === "completed").slice(0, 5));
    } catch {
      // History load is optional
    }
  };

  // Start interview
  const startInterview = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);

    try {
      const session = await interviewService.startInterview({
        type: interviewType as "hr" | "behavioral" | "technical" | "coding",
        resume_text: resumeText,
        job_description: jobDescription,
        experience_years: experience,
        skills: skillsArray,
      });

      setSessionId(session.id);
      const qs = session.questions || [];
      setQuestions(qs);
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setCurrentAnswer("");
      setQuestionStartTime(Date.now());
      setStep("interview");

      // AI greeting with user's name
      const firstName = userName || "there";
      const greeting = `Hello ${firstName}! I'm ${currentRecruiter.name}, your AI interviewer today. I've reviewed your profile and I'm excited to learn more about you. Let's start with the first question.`;
      setAiMessage(greeting);
      setIsAiSpeaking(true);
      setTimeout(() => setIsAiSpeaking(false), 3000);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to start interview. Please check your connection and try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [interviewType, resumeText, jobDescription, experience, skills, currentRecruiter.name, userName]);

  // Submit answer
  const submitAnswer = useCallback(async (answer: string) => {
    if (!answer.trim() || !sessionId) return;

    const duration = Math.floor((Date.now() - questionStartTime) / 1000);
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return;

    const newAnswers = [...answers, { question: currentQ.question, answer, duration }];
    setAnswers(newAnswers);
    setCurrentAnswer("");

    try {
      const result = await interviewService.submitAnswer({
        session_id: sessionId,
        question_id: currentQ.id,
        answer: answer,
        duration_seconds: duration,
      });

      if (result.is_complete) {
        setIsAiSpeaking(true);
        setAiMessage("Thank you! That was our last question. Let me generate your interview report now.");
        setTimeout(() => {
          setIsAiSpeaking(false);
          // Load the final session to get report
          interviewService.getSession(sessionId).then((session) => {
            if (session.scores && session.report) {
              const scores = session.scores;
              const r = session.report;
              const mappedReport: InterviewReport = {
                communication: scores.communication,
                technicalSkills: scores.technical,
                confidence: scores.confidence,
                problemSolving: scores.problem_solving,
                english: scores.english,
                bodyLanguage: Math.round((scores.communication + scores.confidence) / 2),
                overall: scores.overall,
                strengths: r.strengths || [],
                weaknesses: r.weaknesses || [],
                improvements: r.improvements || [],
                resources: r.resources || [],
                feedback: r.detailed_feedback || [],
                totalQuestions: newAnswers.length,
                answeredQuestions: newAnswers.length,
                duration: duration,
              };
              setReport(mappedReport);
              setStep("report");
            }
          });
        }, 2000);
      } else if (result.next_question) {
        // Move to next question with AI feedback
        const nextIndex = questions.findIndex((q) => q.id === result.next_question!.id);
        if (nextIndex >= 0) setCurrentQuestionIndex(nextIndex);
        setQuestionStartTime(Date.now());

        setTimeout(() => {
          setAiMessage(result.ai_feedback + " " + result.next_question?.question);
          setIsAiSpeaking(true);
          setTimeout(() => setIsAiSpeaking(false), 3000);
        }, 500);
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to submit answer. Please try again.";
      setError(message);
      // Revert the answer on failure
      setAnswers(answers);
    }
  }, [answers, currentQuestionIndex, questions, questionStartTime, sessionId]);

  // Handle file upload
  const handleFileUpload = (file: File | null, type: "resume" | "job") => {
    if (!file) return;
    if (type === "resume") {
      setResumeFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setResumeText(text.substring(0, 3000));
      };
      reader.readAsText(file);
    } else {
      setJobFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setJobDescription(text.substring(0, 3000));
      };
      reader.readAsText(file);
    }
  };

  // End call
  const endCall = useCallback(async () => {
    if (sessionId) {
      try {
        const session = await interviewService.completeSession(sessionId);
        if (session.scores && session.report) {
          const s = session.scores;
          const r = session.report;
          const mappedReport: InterviewReport = {
            communication: s.communication,
            technicalSkills: s.technical,
            confidence: s.confidence,
            problemSolving: s.problem_solving,
            english: s.english,
            bodyLanguage: Math.round((s.communication + s.confidence) / 2),
            overall: s.overall,
            strengths: r.strengths || [],
            weaknesses: r.weaknesses || [],
            improvements: r.improvements || [],
            resources: r.resources || [],
            feedback: r.detailed_feedback || [],
            totalQuestions: answers.length,
            answeredQuestions: answers.length,
            duration: session.duration_seconds,
          };
          setReport(mappedReport);
        }
      } catch {
        // Generate local report as fallback
        if (answers.length > 0) {
          const localReport = generateReport(answers);
          setReport(localReport);
        }
      }
    } else if (answers.length > 0) {
      const localReport = generateReport(answers);
      setReport(localReport);
    }
    setStep("report");
  }, [answers, sessionId]);

  // Retry
  const retry = () => {
    setStep("setup");
    setSessionId(null);
    setQuestions([]);
    setAnswers([]);
    setReport(null);
    setAiMessage("");
    setCurrentQuestionIndex(0);
    setError(null);
    loadInterviewHistory();
  };

  // Load a previous session's report
  const loadSessionReport = async (session: InterviewSession) => {
    if (!session.scores || !session.report) return;
    const s = session.scores;
    const r = session.report;
    const mappedReport: InterviewReport = {
      communication: s.communication,
      technicalSkills: s.technical,
      confidence: s.confidence,
      problemSolving: s.problem_solving,
      english: s.english,
      bodyLanguage: Math.round((s.communication + s.confidence) / 2),
      overall: s.overall,
      strengths: r.strengths || [],
      weaknesses: r.weaknesses || [],
      improvements: r.improvements || [],
      resources: r.resources || [],
      feedback: r.detailed_feedback || [],
      totalQuestions: session.questions?.length || 0,
      answeredQuestions: session.answers?.length || 0,
      duration: session.duration_seconds,
    };
    setReport(mappedReport);
    setStep("report");
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto min-h-[calc(100vh-8rem)]">
      {/* Error banner */}
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div className="flex-1">{error}</div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[
          { id: "setup" as const, label: "Setup", icon: FileText },
          { id: "interview" as const, label: "Interview", icon: MessageSquare },
          { id: "report" as const, label: "Report", icon: CheckCircle2 },
        ].map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              step === s.id
                ? "bg-[#2563EB] text-white shadow-lg shadow-blue-500/25"
                : step === "report" && (s.id === "setup" || s.id === "interview")
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
            )}>
              <s.icon size={12} />
              {s.label}
            </div>
            {i < 2 && <div className="w-6 h-px bg-slate-200 dark:bg-slate-700" />}
          </div>
        ))}
      </div>

      {/* SETUP STEP */}
      {step === "setup" && (
        <div className="space-y-6">
          {/* Header with history button */}
          <Glass className="p-6 bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <Sparkles size={22} />
                  <h2 className="text-xl font-bold">AI Interview Simulator</h2>
                </div>
                <p className="text-blue-100/90 text-sm">
                  Practice with a realistic AI recruiter. Upload your resume, choose an interview type, and get personalized feedback.
                </p>
              </div>
              {previousSessions.length > 0 && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-all"
                >
                  <History size={14} />
                  History
                </button>
              )}
            </div>
          </Glass>

          {/* Interview History */}
          {showHistory && previousSessions.length > 0 && (
            <Glass className="p-4">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-3 flex items-center gap-2">
                <History size={14} className="text-blue-500" />
                Previous Interviews
              </h3>
              <div className="space-y-2">
                {previousSessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => loadSessionReport(s)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                      {s.type[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 capitalize">{s.type} Interview</p>
                      <p className="text-xs text-slate-400">
                        {new Date(s.created_at).toLocaleDateString()} · {s.duration_seconds}s · Score: {s.scores?.overall || "N/A"}%
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-slate-400" />
                  </button>
                ))}
              </div>
            </Glass>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left: Setup Form */}
            <div className="space-y-4">
              {/* Interview Type */}
              <Glass className="p-5">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-3">
                  <Target size={16} className="text-blue-500" />
                  Interview Type
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {INTERVIEW_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setInterviewType(type.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl text-left transition-all border",
                        interviewType === type.id
                          ? "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30"
                          : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-gradient-to-br",
                        type.color,
                        "text-white"
                      )}>
                        {type.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{type.label}</p>
                        <p className="text-[11px] text-slate-400 truncate">{type.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </Glass>

              {/* Resume Upload */}
              <Glass className="p-5">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-3">
                  <Upload size={16} className="text-blue-500" />
                  Resume & Job Description
                </h3>
                <div className="space-y-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all",
                      resumeFile
                        ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/10"
                        : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700"
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files?.[0] || null, "resume")}
                    />
                    {resumeFile ? (
                      <div className="flex items-center gap-2 justify-center">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">{resumeFile.name}</span>
                      </div>
                    ) : (
                      <div>
                        <Upload size={20} className="mx-auto mb-1 text-slate-300" />
                        <p className="text-xs text-slate-400">Upload your resume (PDF, DOC, TXT)</p>
                      </div>
                    )}
                  </div>

                  <div
                    onClick={() => jobInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all",
                      jobFile
                        ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/10"
                        : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700"
                    )}
                  >
                    <input
                      ref={jobInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files?.[0] || null, "job")}
                    />
                    {jobFile ? (
                      <div className="flex items-center gap-2 justify-center">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">{jobFile.name}</span>
                      </div>
                    ) : (
                      <div>
                        <FileText size={20} className="mx-auto mb-1 text-slate-300" />
                        <p className="text-xs text-slate-400">Upload job description (optional)</p>
                      </div>
                    )}
                  </div>
                </div>
              </Glass>
            </div>

            {/* Right: Profile Info */}
            <div className="space-y-4">
              <Glass className="p-5">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-3">
                  <User size={16} className="text-blue-500" />
                  Your Profile
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Years of Experience</label>
                    <input
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="e.g., 3 years"
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 border border-slate-200 dark:border-slate-700/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Skills (comma separated)</label>
                    <input
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="e.g., React, Python, SQL, Leadership"
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 border border-slate-200 dark:border-slate-700/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Resume Text</label>
                    <textarea
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste your resume content here..."
                      rows={4}
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 border border-slate-200 dark:border-slate-700/50 resize-none"
                    />
                  </div>
                </div>
              </Glass>

              {/* AI Recruiter Preview */}
              <Glass className="p-5">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-3">
                  <Brain size={16} className="text-violet-500" />
                  Your AI Interviewer
                </h3>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50">
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center text-3xl bg-gradient-to-br",
                    currentRecruiter.color, "text-white"
                  )}>
                    {currentRecruiter.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{currentRecruiter.name}</p>
                    <p className="text-xs text-slate-400">{currentRecruiter.title}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      5 personalized questions will be generated based on your profile
                    </p>
                  </div>
                </div>
              </Glass>

              {/* Start Button */}
              <PrimaryBtn
                onClick={startInterview}
                disabled={isLoading || !resumeText}
                className="w-full py-4 text-base"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Preparing your interview...
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    Start AI Interview
                  </>
                )}
              </PrimaryBtn>
            </div>
          </div>
        </div>
      )}

      {/* INTERVIEW STEP */}
      {step === "interview" && (
        <div className="flex flex-col h-[calc(100vh-12rem)]">
          {/* Question progress */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-2.5 h-2.5 rounded-full transition-all",
                      i === currentQuestionIndex ? "bg-[#2563EB] scale-125" :
                        i < currentQuestionIndex ? "bg-emerald-400" :
                          "bg-slate-200 dark:bg-slate-700"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-400">
                {currentQuestionIndex + 1} / {questions.length}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock size={12} />
              <span>{Math.floor((Date.now() - questionStartTime) / 1000)}s</span>
            </div>
          </div>

          {/* Video Call Area */}
          <div className="flex-1 min-h-0">
            <AIVideoCall
              aiName={currentRecruiter.name}
              aiAvatar={currentRecruiter.avatar}
              aiColor={currentRecruiter.color}
              onMessage={(msg) => submitAnswer(msg)}
              aiMessage={aiMessage}
              isAiSpeaking={isAiSpeaking}
              onEndCall={endCall}
              muted={isMuted}
              onToggleMute={() => setIsMuted(!isMuted)}
            />
          </div>

          {/* Answer input bar */}
          <Glass className="mt-3 p-3">
            <div className="flex gap-3 items-center">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0",
                  isMuted
                    ? "bg-red-100 dark:bg-red-900/30 text-red-500"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                )}
              >
                {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              <input
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submitAnswer(currentAnswer);
                  }
                }}
                placeholder="Type your answer here..."
                className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 border border-slate-200 dark:border-slate-700/50"
              />
              <PrimaryBtn
                onClick={() => submitAnswer(currentAnswer)}
                disabled={!currentAnswer.trim()}
                className="py-2.5 px-5 text-sm shrink-0"
              >
                Send
                <ChevronRight size={14} />
              </PrimaryBtn>
            </div>
          </Glass>

          {/* Tips panel */}
          {showTips && questions[currentQuestionIndex] && (
            <div className="mt-3">
              <Glass className="p-4 flex items-start gap-3">
                <Lightbulb size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tip</p>
                    <button onClick={() => setShowTips(false)} className="text-xs text-slate-400 hover:text-slate-600">Hide</button>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{questions[currentQuestionIndex].tip}</p>
                </div>
              </Glass>
            </div>
          )}
        </div>
      )}

      {/* REPORT STEP */}
      {step === "report" && report && (
        <InterviewReportComponent
          report={report}
          onRetry={retry}
          onDownload={() => {
            const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "interview-report.json";
            a.click();
            URL.revokeObjectURL(url);
          }}
        />
      )}
    </div>
  );
}