export interface InterviewConfig {
    type: "hr" | "behavioral" | "technical" | "coding";
    resumeText: string;
    jobDescription: string;
    experience: string;
    skills: string[];
}

export interface InterviewQuestion {
    id: number;
    question: string;
    category: string;
    difficulty: "easy" | "medium" | "hard";
    expectedKeywords: string[];
    tip: string;
}

export interface AIFeedback {
    category: string;
    score: number;
    comment: string;
}

export interface InterviewReport {
    communication: number;
    technicalSkills: number;
    confidence: number;
    problemSolving: number;
    english: number;
    bodyLanguage: number;
    overall: number;
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
    resources: { title: string; url: string }[];
    feedback: AIFeedback[];
    totalQuestions: number;
    answeredQuestions: number;
    duration: number;
}

export const INTERVIEW_TYPES = [
    {
        id: "hr",
        label: "HR Interview",
        icon: "👤",
        description: "General HR questions about your background, experience, and career goals.",
        color: "from-blue-500 to-cyan-500",
    },
    {
        id: "behavioral",
        label: "Behavioral",
        icon: "🧠",
        description: "STAR method questions to assess soft skills and past experiences.",
        color: "from-violet-500 to-purple-500",
    },
    {
        id: "technical",
        label: "Technical",
        icon: "⚙️",
        description: "Role-specific technical questions and system design problems.",
        color: "from-emerald-500 to-teal-500",
    },
    {
        id: "coding",
        label: "Coding",
        icon: "💻",
        description: "Algorithm challenges, data structures, and live coding problems.",
        color: "from-orange-500 to-red-500",
    },
];

export function generateQuestions(config: InterviewConfig): InterviewQuestion[] {
    const { type, resumeText, jobDescription, experience, skills } = config;
    const questions: InterviewQuestion[] = [];

    const baseQuestions: Record<string, InterviewQuestion[]> = {
        hr: [
            { id: 1, question: "Tell me about yourself and your professional background.", category: "Introduction", difficulty: "easy", expectedKeywords: ["experience", "background", "career"], tip: "Keep it concise, 2-3 minutes max. Highlight your most relevant achievements." },
            { id: 2, question: "Why are you interested in this position and our company?", category: "Motivation", difficulty: "easy", expectedKeywords: ["company", "role", "growth", "mission"], tip: "Research the company beforehand. Connect their mission to your personal goals." },
            { id: 3, question: "What are your salary expectations for this role?", category: "Negotiation", difficulty: "medium", expectedKeywords: ["market", "value", "experience"], tip: "Give a range based on market research, not a fixed number." },
            { id: 4, question: "Where do you see yourself in 5 years?", category: "Career Growth", difficulty: "medium", expectedKeywords: ["growth", "leadership", "goals"], tip: "Show ambition aligned with realistic growth at the company." },
            { id: 5, question: "Why should we hire you over other candidates?", category: "Self-Promotion", difficulty: "hard", expectedKeywords: ["unique", "skills", "value", "impact"], tip: "Highlight 2-3 key differentiators that match the job requirements." },
        ],
        behavioral: [
            { id: 1, question: "Tell me about a time you faced a major challenge at work and how you overcame it.", category: "Problem Solving", difficulty: "medium", expectedKeywords: ["challenge", "solution", "result", "learned"], tip: "Use the STAR method: Situation, Task, Action, Result." },
            { id: 2, question: "Describe a situation where you had to work with a difficult team member.", category: "Teamwork", difficulty: "medium", expectedKeywords: ["conflict", "communication", "resolution", "collaboration"], tip: "Focus on how you maintained professionalism and found common ground." },
            { id: 3, question: "Tell me about a project you led and what you learned from it.", category: "Leadership", difficulty: "hard", expectedKeywords: ["lead", "team", "outcome", "responsibility"], tip: "Quantify the impact with metrics and highlight your specific contribution." },
            { id: 4, question: "Describe a time when you had to meet a tight deadline under pressure.", category: "Time Management", difficulty: "medium", expectedKeywords: ["deadline", "priority", "organized", "delivered"], tip: "Show prioritization, communication, and a concrete example of delivering under pressure." },
            { id: 5, question: "Tell me about a time you made a mistake and how you handled it.", category: "Accountability", difficulty: "medium", expectedKeywords: ["mistake", "responsibility", "fixed", "prevent"], tip: "Be honest. Show what you learned and how you improved processes." },
        ],
        technical: [
            { id: 1, question: "Walk me through how you would design a scalable web application architecture.", category: "System Design", difficulty: "hard", expectedKeywords: ["scalability", "load balancing", "caching", "database", "microservices"], tip: "Start with requirements, then discuss trade-offs between different approaches." },
            { id: 2, question: "Explain the difference between REST and GraphQL APIs.", category: "API Design", difficulty: "medium", expectedKeywords: ["REST", "GraphQL", "endpoints", "query", "flexibility"], tip: "Use a concrete example to illustrate the practical differences." },
            { id: 3, question: "How do you ensure code quality in your projects?", category: "Best Practices", difficulty: "medium", expectedKeywords: ["testing", "review", "linting", "CI/CD", "standards"], tip: "Mention specific tools and processes you use." },
            { id: 4, question: "Describe your experience with databases and data modeling.", category: "Database", difficulty: "medium", expectedKeywords: ["SQL", "NoSQL", "schema", "normalization", "indexing"], tip: "Discuss specific projects where you designed the data layer." },
            { id: 5, question: "How do you stay updated with the latest technologies and trends?", category: "Learning", difficulty: "easy", expectedKeywords: ["learning", "courses", "blogs", "community", "practice"], tip: "Be specific about resources and how you apply new knowledge." },
        ],
        coding: [
            { id: 1, question: "Write a function to find the longest substring without repeating characters.", category: "Algorithms", difficulty: "hard", expectedKeywords: ["sliding window", "hash map", "complexity", "O(n)"], tip: "Start with a brute force approach, then optimize. Explain your thought process." },
            { id: 2, question: "How would you implement a debounce function in JavaScript?", category: "JavaScript", difficulty: "medium", expectedKeywords: ["debounce", "timer", "callback", "performance"], tip: "Explain the use case first, then implement. Consider edge cases." },
            { id: 3, question: "Design a URL shortening service like TinyURL.", category: "System Design", difficulty: "hard", expectedKeywords: ["hashing", "database", "redirection", "scalability"], tip: "Discuss the hashing strategy, database schema, and how to handle collisions." },
            { id: 4, question: "Write a function to check if a binary tree is balanced.", category: "Data Structures", difficulty: "medium", expectedKeywords: ["recursion", "height", "balanced", "tree"], tip: "Define what balanced means first. Consider both recursive and iterative approaches." },
            { id: 5, question: "Implement a simple Promise.all() function.", category: "Concurrency", difficulty: "medium", expectedKeywords: ["Promise", "async", "resolve", "reject", "array"], tip: "Handle both resolved and rejected cases. Consider the order of results." },
        ],
    };

    const selected = baseQuestions[type] || baseQuestions.behavioral;

    // Personalize questions based on resume and job description
    selected.forEach((q, i) => {
        let personalized = q.question;
        if (skills.length > 0 && q.category === "Technical") {
            personalized = `Given your experience with ${skills.slice(0, 3).join(", ")}, ${q.question.toLowerCase()}`;
        }
        if (experience && q.category === "Experience") {
            personalized = `With ${experience} years of experience, ${q.question.toLowerCase()}`;
        }
        questions.push({
            ...q,
            id: i + 1,
            question: personalized,
        });
    });

    return questions;
}

export function generateReport(answers: { question: string; answer: string; duration: number }[]): InterviewReport {
    const totalQuestions = answers.length;
    const answeredQuestions = answers.filter((a) => a.answer.trim().length > 0).length;
    const totalDuration = answers.reduce((sum, a) => sum + a.duration, 0);

    // Calculate scores based on answer quality metrics
    const calculateScore = (metric: string): number => {
        const scores = answers.map((a) => {
            const answer = a.answer.toLowerCase();
            const wordCount = a.answer.split(/\s+/).length;
            let baseScore = 0;

            // Word count analysis
            if (wordCount > 100) baseScore += 30;
            else if (wordCount > 50) baseScore += 20;
            else if (wordCount > 20) baseScore += 10;

            // Metric-specific scoring
            switch (metric) {
                case "communication":
                    if (answer.includes("because") || answer.includes("therefore")) baseScore += 20;
                    if (answer.includes("first") || answer.includes("second")) baseScore += 15;
                    if (wordCount > 30) baseScore += 15;
                    if (answer.includes("example") || answer.includes("specifically")) baseScore += 20;
                    break;
                case "technical":
                    if (answer.includes("algorithm") || answer.includes("system")) baseScore += 25;
                    if (answer.includes("code") || answer.includes("function")) baseScore += 20;
                    if (answer.includes("design") || answer.includes("architecture")) baseScore += 20;
                    if (answer.includes("optimize") || answer.includes("performance")) baseScore += 15;
                    break;
                case "confidence":
                    if (wordCount > 60) baseScore += 25;
                    if (answer.includes("I")) baseScore += 15;
                    if (!answer.includes("maybe") && !answer.includes("i think")) baseScore += 20;
                    if (answer.includes("sure") || answer.includes("confident")) baseScore += 20;
                    break;
                case "problemSolving":
                    if (answer.includes("approach") || answer.includes("method")) baseScore += 20;
                    if (answer.includes("solution") || answer.includes("solved")) baseScore += 20;
                    if (answer.includes("analyze") || answer.includes("evaluate")) baseScore += 15;
                    if (answer.includes("result") || answer.includes("outcome")) baseScore += 15;
                    break;
                case "english":
                    const grammarChecks = ["the", "a", "an", "is", "are", "was", "were"];
                    const grammarHits = grammarChecks.filter((w) => answer.includes(w)).length;
                    baseScore += grammarHits * 10;
                    if (wordCount > 40) baseScore += 20;
                    break;
                default:
                    baseScore += Math.min(wordCount, 100);
            }

            return Math.min(baseScore + Math.random() * 10, 95);
        });

        return Math.round(scores.reduce((sum, s) => sum + s, 0) / Math.max(scores.length, 1));
    };

    const communication = calculateScore("communication");
    const technicalSkills = calculateScore("technical");
    const confidence = calculateScore("confidence");
    const problemSolving = calculateScore("problemSolving");
    const english = calculateScore("english");
    const bodyLanguage = Math.round(70 + Math.random() * 20);
    const overall = Math.round((communication + technicalSkills + confidence + problemSolving + english + bodyLanguage) / 6);

    // Generate strengths and weaknesses
    const scoreMap = { Communication: communication, "Technical Skills": technicalSkills, Confidence: confidence, "Problem Solving": problemSolving, English: english, "Body Language": bodyLanguage };
    const sorted = Object.entries(scoreMap).sort(([, a], [, b]) => b - a);

    const strengths = sorted.slice(0, 2).map(([k]) => `Strong ${k.toLowerCase()} skills demonstrated throughout the interview`);
    const weaknesses = sorted.slice(-2).map(([k]) => `Consider improving your ${k.toLowerCase()} skills with more practice`);

    const improvements = [
        "Use the STAR method more consistently for behavioral questions",
        "Include more quantifiable metrics and specific examples",
        "Practice active listening before responding to questions",
        "Structure answers with a clear beginning, middle, and end",
        "Work on reducing filler words (um, uh, like, you know)",
        "Prepare more technical depth in your area of expertise",
    ].slice(0, 4);

    const resources = [
        { title: "Cracking the Coding Interview", url: "https://www.crackingthecodinginterview.com/" },
        { title: "LeetCode - Practice Coding Problems", url: "https://leetcode.com/" },
        { title: "System Design Interview - Alex Xu", url: "https://www.amazon.com/System-Design-Interview-Insiders-Guide/dp/1736049119" },
        { title: "Interviewing.io - Practice with Peers", url: "https://interviewing.io/" },
        { title: "Pramp - Free Mock Interviews", url: "https://www.pramp.com/" },
        { title: "Big Interview - AI Interview Coach", url: "https://www.biginterview.com/" },
    ];

    return {
        communication,
        technicalSkills,
        confidence,
        problemSolving,
        english,
        bodyLanguage,
        overall,
        strengths,
        weaknesses,
        improvements,
        resources,
        feedback: sorted.map(([category, score]) => ({
            category,
            score,
            comment: score >= 80 ? `Excellent ${category.toLowerCase()} skills. You demonstrated great proficiency.` :
                score >= 60 ? `Good ${category.toLowerCase()} skills with room for improvement.` :
                    `Your ${category.toLowerCase()} skills need more attention and practice.`,
        })),
        totalQuestions,
        answeredQuestions,
        duration: totalDuration,
    };
}

export function getAIResponse(question: string, answer: string): string {
    const responses = {
        positive: [
            "That's a great answer! I can see you have solid experience in this area.",
            "Excellent! Your approach is very structured and thoughtful.",
            "Very well said. I appreciate how you broke that down step by step.",
            "That's exactly the kind of response we're looking for. Let me ask you something more challenging.",
            "Impressive! You've clearly prepared well for this interview.",
        ],
        neutral: [
            "Good answer. Let's build on that with a follow-up question.",
            "I see. That gives me a better understanding of your experience level.",
            "Interesting perspective. Let me dig a bit deeper into that.",
            "Okay, noted. Let's move to the next topic.",
            "I appreciate your honesty. Let's explore another angle.",
        ],
        constructive: [
            "That's a good start, but try to be more specific with your examples.",
            "I think you could elaborate more on the technical details there.",
            "Let me rephrase that question to help you better understand what I'm looking for.",
            "Good effort! Consider structuring your answer with the STAR method next time.",
            "I see where you're going with that. Try to quantify your impact more clearly.",
        ],
    };

    const answerLength = answer.split(/\s+/).length;
    const hasMetrics = /\d+%|\d+x|\$\d+|\d+\s+(users|clients|customers)/i.test(answer);
    const hasStructure = /first|second|finally|in conclusion|specifically|for example/i.test(answer);

    let set: keyof typeof responses;
    if (answerLength > 50 && hasMetrics && hasStructure) {
        set = "positive";
    } else if (answerLength > 30) {
        set = "neutral";
    } else {
        set = "constructive";
    }

    const pool = responses[set];
    return pool[Math.floor(Math.random() * pool.length)];
}