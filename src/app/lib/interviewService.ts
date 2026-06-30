import api from "./api";

export interface InterviewSession {
    id: number;
    user_id: number;
    type: "hr" | "behavioral" | "technical" | "coding";
    status: "pending" | "in_progress" | "completed" | "cancelled";
    resume_text: string;
    job_description: string;
    experience_years: string;
    skills: string[];
    questions: InterviewQuestionData[];
    answers: InterviewAnswerData[];
    scores: InterviewScores | null;
    report: InterviewReportData | null;
    started_at: string | null;
    completed_at: string | null;
    duration_seconds: number;
    created_at: string;
    updated_at: string;
}

export interface InterviewQuestionData {
    id: number;
    question: string;
    category: string;
    difficulty: string;
    tip: string;
    order: number;
}

export interface InterviewAnswerData {
    question_id: number;
    question: string;
    answer: string;
    duration_seconds: number;
    ai_feedback: string;
    score: number;
}

export interface InterviewScores {
    communication: number;
    confidence: number;
    technical: number;
    problem_solving: number;
    english: number;
    overall: number;
}

export interface InterviewReportData {
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
    resources: { title: string; url: string }[];
    detailed_feedback: { category: string; score: number; comment: string }[];
}

export interface StartInterviewRequest {
    type: "hr" | "behavioral" | "technical" | "coding";
    resume_text: string;
    job_description: string;
    experience_years: string;
    skills: string[];
}

export interface SubmitAnswerRequest {
    session_id: number;
    question_id: number;
    answer: string;
    duration_seconds: number;
}

export interface GenerateFollowUpRequest {
    session_id: number;
    previous_answer: string;
    question: string;
}

class InterviewService {
    private baseUrl = "/interviews";

    async startInterview(data: StartInterviewRequest): Promise<InterviewSession> {
        const response = await api.post(`${this.baseUrl}/start`, data);
        return response.data.data;
    }

    async submitAnswer(data: SubmitAnswerRequest): Promise<{
        ai_feedback: string;
        score: number;
        next_question: InterviewQuestionData | null;
        is_complete: boolean;
    }> {
        const response = await api.post(`${this.baseUrl}/answer`, data);
        return response.data.data;
    }

    async generateFollowUp(data: GenerateFollowUpRequest): Promise<{
        question: string;
        category: string;
        tip: string;
    }> {
        const response = await api.post(`${this.baseUrl}/follow-up`, data);
        return response.data.data;
    }

    async getSession(sessionId: number): Promise<InterviewSession> {
        const response = await api.get(`${this.baseUrl}/${sessionId}`);
        return response.data.data;
    }

    async getUserSessions(): Promise<InterviewSession[]> {
        const response = await api.get(`${this.baseUrl}`);
        return response.data.data;
    }

    async completeSession(sessionId: number): Promise<InterviewSession> {
        const response = await api.post(`${this.baseUrl}/${sessionId}/complete`);
        return response.data.data;
    }

    async getUserProfile(): Promise<{
        id: number;
        name: string;
        email: string;
        resume_text: string;
        skills: string[];
        experience_years: string;
        interviews_count: number;
        documents: { id: number; name: string; type: string }[];
    }> {
        const response = await api.get("/user/profile");
        return response.data.data;
    }
}

export const interviewService = new InterviewService();
export default interviewService;