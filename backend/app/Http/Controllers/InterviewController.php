<?php

namespace App\Http\Controllers;

use App\Models\Interview;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class InterviewController extends Controller
{
    private const QUESTIONS = [
        'hr' => [
            ['question' => 'Tell me about yourself and your professional background.', 'category' => 'Introduction', 'difficulty' => 'easy', 'tip' => 'Keep it concise, 2-3 minutes max. Highlight your most relevant achievements.'],
            ['question' => 'Why are you interested in this position and our company?', 'category' => 'Motivation', 'difficulty' => 'easy', 'tip' => 'Research the company beforehand. Connect their mission to your personal goals.'],
            ['question' => 'What are your salary expectations for this role?', 'category' => 'Negotiation', 'difficulty' => 'medium', 'tip' => 'Give a range based on market research, not a fixed number.'],
            ['question' => 'Where do you see yourself in 5 years?', 'category' => 'Career Growth', 'difficulty' => 'medium', 'tip' => 'Show ambition aligned with realistic growth at the company.'],
            ['question' => 'Why should we hire you over other candidates?', 'category' => 'Self-Promotion', 'difficulty' => 'hard', 'tip' => 'Highlight 2-3 key differentiators that match the job requirements.'],
        ],
        'behavioral' => [
            ['question' => 'Tell me about a time you faced a major challenge at work and how you overcame it.', 'category' => 'Problem Solving', 'difficulty' => 'medium', 'tip' => 'Use the STAR method: Situation, Task, Action, Result.'],
            ['question' => 'Describe a situation where you had to work with a difficult team member.', 'category' => 'Teamwork', 'difficulty' => 'medium', 'tip' => 'Focus on how you maintained professionalism and found common ground.'],
            ['question' => 'Tell me about a project you led and what you learned from it.', 'category' => 'Leadership', 'difficulty' => 'hard', 'tip' => 'Quantify the impact with metrics and highlight your specific contribution.'],
            ['question' => 'Describe a time when you had to meet a tight deadline under pressure.', 'category' => 'Time Management', 'difficulty' => 'medium', 'tip' => 'Show prioritization, communication, and a concrete example of delivering under pressure.'],
            ['question' => 'Tell me about a time you made a mistake and how you handled it.', 'category' => 'Accountability', 'difficulty' => 'medium', 'tip' => 'Be honest. Show what you learned and how you improved processes.'],
        ],
        'technical' => [
            ['question' => 'Walk me through how you would design a scalable web application architecture.', 'category' => 'System Design', 'difficulty' => 'hard', 'tip' => 'Start with requirements, then discuss trade-offs between different approaches.'],
            ['question' => 'Explain the difference between REST and GraphQL APIs.', 'category' => 'API Design', 'difficulty' => 'medium', 'tip' => 'Use a concrete example to illustrate the practical differences.'],
            ['question' => 'How do you ensure code quality in your projects?', 'category' => 'Best Practices', 'difficulty' => 'medium', 'tip' => 'Mention specific tools and processes you use.'],
            ['question' => 'Describe your experience with databases and data modeling.', 'category' => 'Database', 'difficulty' => 'medium', 'tip' => 'Discuss specific projects where you designed the data layer.'],
            ['question' => 'How do you stay updated with the latest technologies and trends?', 'category' => 'Learning', 'difficulty' => 'easy', 'tip' => 'Be specific about resources and how you apply new knowledge.'],
        ],
        'coding' => [
            ['question' => 'Write a function to find the longest substring without repeating characters.', 'category' => 'Algorithms', 'difficulty' => 'hard', 'tip' => 'Start with a brute force approach, then optimize. Explain your thought process.'],
            ['question' => 'How would you implement a debounce function in JavaScript?', 'category' => 'JavaScript', 'difficulty' => 'medium', 'tip' => 'Explain the use case first, then implement. Consider edge cases.'],
            ['question' => 'Design a URL shortening service like TinyURL.', 'category' => 'System Design', 'difficulty' => 'hard', 'tip' => 'Discuss the hashing strategy, database schema, and how to handle collisions.'],
            ['question' => 'Write a function to check if a binary tree is balanced.', 'category' => 'Data Structures', 'difficulty' => 'medium', 'tip' => 'Define what balanced means first. Consider both recursive and iterative approaches.'],
            ['question' => 'Implement a simple Promise.all() function.', 'category' => 'Concurrency', 'difficulty' => 'medium', 'tip' => 'Handle both resolved and rejected cases. Consider the order of results.'],
        ],
    ];

    private const AI_FEEDBACK_POSITIVE = [
        "That's a great answer! I can see you have solid experience in this area.",
        "Excellent! Your approach is very structured and thoughtful.",
        "Very well said. I appreciate how you broke that down step by step.",
        "That's exactly the kind of response we're looking for.",
        "Impressive! You've clearly prepared well for this interview.",
    ];

    private const AI_FEEDBACK_NEUTRAL = [
        "Good answer. Let's build on that with a follow-up question.",
        "I see. That gives me a better understanding of your experience level.",
        "Interesting perspective. Let me dig a bit deeper into that.",
        "Okay, noted. Let's move to the next topic.",
        "I appreciate your honesty. Let's explore another angle.",
    ];

    private const AI_FEEDBACK_CONSTRUCTIVE = [
        "That's a good start, but try to be more specific with your examples.",
        "I think you could elaborate more on the technical details there.",
        "Let me rephrase that question to help you better understand what I'm looking for.",
        "Good effort! Consider structuring your answer with the STAR method next time.",
        "I see where you're going with that. Try to quantify your impact more clearly.",
    ];

    public function index(Request $request)
    {
        $interviews = Interview::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $interviews]);
    }

    public function show(Request $request, $id)
    {
        $interview = Interview::where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json(['data' => $interview]);
    }

    public function start(Request $request)
    {
        $request->validate([
            'type' => 'required|in:hr,behavioral,technical,coding',
            'resume_text' => 'nullable|string',
            'job_description' => 'nullable|string',
            'experience_years' => 'nullable|string',
            'skills' => 'nullable|array',
            'skills.*' => 'string',
        ]);

        $user = $request->user();
        $type = $request->input('type');
        $skills = $request->input('skills', []);
        $resumeText = $request->input('resume_text', '');
        $jobDescription = $request->input('job_description', '');
        $experienceYears = $request->input('experience_years', '');

        // Generate personalized questions
        $baseQuestions = self::QUESTIONS[$type] ?? self::QUESTIONS['behavioral'];
        $questions = [];

        foreach ($baseQuestions as $index => $q) {
            $personalized = $q['question'];

            // Personalize based on skills
            if (!empty($skills) && $q['category'] === 'Technical') {
                $skillList = implode(', ', array_slice($skills, 0, 3));
                $personalized = "Given your experience with {$skillList}, " . lcfirst($q['question']);
            }

            // Personalize based on experience
            if (!empty($experienceYears) && in_array($q['category'], ['Leadership', 'Problem Solving'])) {
                $personalized = "With {$experienceYears} of experience, " . lcfirst($q['question']);
            }

            // Personalize based on resume
            if (!empty($resumeText) && $q['category'] === 'Introduction') {
                $name = explode(' ', $user->name)[0];
                $personalized = "{$name}, I've reviewed your background. " . $q['question'];
            }

            $questions[] = [
                'id' => $index + 1,
                'question' => $personalized,
                'category' => $q['category'],
                'difficulty' => $q['difficulty'],
                'tip' => $q['tip'],
                'order' => $index + 1,
            ];
        }

        $interview = Interview::create([
            'user_id' => $user->id,
            'type' => $type,
            'status' => 'in_progress',
            'resume_text' => $resumeText,
            'job_description' => $jobDescription,
            'experience_years' => $experienceYears,
            'skills' => $skills,
            'questions' => $questions,
            'answers' => [],
            'scores' => null,
            'report' => null,
            'started_at' => now(),
            'duration_seconds' => 0,
        ]);

        Log::info("Interview started", ['user_id' => $user->id, 'interview_id' => $interview->id, 'type' => $type]);

        return response()->json(['data' => $interview], 201);
    }

    public function submitAnswer(Request $request)
    {
        $request->validate([
            'session_id' => 'required|exists:interviews,id',
            'question_id' => 'required|integer',
            'answer' => 'required|string|min:1',
            'duration_seconds' => 'required|integer|min:0',
        ]);

        $interview = Interview::where('user_id', $request->user()->id)
            ->findOrFail($request->session_id);

        if ($interview->status !== 'in_progress') {
            return response()->json(['message' => 'Interview is not in progress'], 400);
        }

        $questions = $interview->questions ?? [];
        $answers = $interview->answers ?? [];
        $questionId = $request->question_id;

        // Find the question
        $currentQuestion = null;
        foreach ($questions as $q) {
            if ($q['id'] === $questionId) {
                $currentQuestion = $q;
                break;
            }
        }

        if (!$currentQuestion) {
            return response()->json(['message' => 'Question not found'], 404);
        }

        // Evaluate the answer
        $answerText = $request->answer;
        $score = $this->evaluateAnswer($answerText, $currentQuestion['category']);
        $aiFeedback = $this->generateFeedback($answerText);

        // Store the answer
        $answers[] = [
            'question_id' => $questionId,
            'question' => $currentQuestion['question'],
            'answer' => $answerText,
            'duration_seconds' => $request->duration_seconds,
            'ai_feedback' => $aiFeedback,
            'score' => $score,
        ];

        // Find next question
        $nextQuestion = null;
        $isComplete = true;
        foreach ($questions as $q) {
            $answered = false;
            foreach ($answers as $a) {
                if ($a['question_id'] === $q['id']) {
                    $answered = true;
                    break;
                }
            }
            if (!$answered) {
                $nextQuestion = $q;
                $isComplete = false;
                break;
            }
        }

        // Update duration
        $totalDuration = array_sum(array_column($answers, 'duration_seconds'));

        $interview->update([
            'answers' => $answers,
            'duration_seconds' => $totalDuration,
            'status' => $isComplete ? 'completed' : 'in_progress',
            'completed_at' => $isComplete ? now() : null,
        ]);

        // If complete, generate report
        if ($isComplete) {
            $report = $this->generateReport($answers, $interview);
            $interview->update([
                'scores' => $report['scores'],
                'report' => $report['report'],
            ]);
        }

        Log::info("Answer submitted", [
            'interview_id' => $interview->id,
            'question_id' => $questionId,
            'score' => $score,
            'is_complete' => $isComplete,
        ]);

        return response()->json([
            'data' => [
                'ai_feedback' => $aiFeedback,
                'score' => $score,
                'next_question' => $nextQuestion,
                'is_complete' => $isComplete,
            ],
        ]);
    }

    public function complete(Request $request, $id)
    {
        $interview = Interview::where('user_id', $request->user()->id)
            ->findOrFail($id);

        if ($interview->status === 'completed') {
            return response()->json(['data' => $interview]);
        }

        $answers = $interview->answers ?? [];
        $report = $this->generateReport($answers, $interview);

        $interview->update([
            'status' => 'completed',
            'completed_at' => now(),
            'scores' => $report['scores'],
            'report' => $report['report'],
        ]);

        Log::info("Interview completed", ['interview_id' => $interview->id]);

        return response()->json(['data' => $interview]);
    }

    public function followUp(Request $request)
    {
        $request->validate([
            'session_id' => 'required|exists:interviews,id',
            'previous_answer' => 'required|string',
            'question' => 'required|string',
        ]);

        $interview = Interview::where('user_id', $request->user()->id)
            ->findOrFail($request->session_id);

        // Generate a follow-up question based on the previous answer
        $answerLength = str_word_count($request->previous_answer);
        $hasMetrics = preg_match('/\d+%|\d+x|\$\d+|\d+\s+(users|clients|customers)/i', $request->previous_answer);

        $followUp = "That's interesting. Can you tell me more about the specific impact your work had on the team or business outcomes?";

        if ($hasMetrics) {
            $followUp = "I noticed you mentioned some impressive metrics. How did you achieve those results, and what challenges did you face along the way?";
        } elseif ($answerLength < 30) {
            $followUp = "Could you elaborate on that with a specific example? I'd love to hear more details about your approach.";
        } else {
            $followUp = "Based on your experience, what would you do differently if you had to approach a similar situation again?";
        }

        return response()->json([
            'data' => [
                'question' => $followUp,
                'category' => 'Follow-up',
                'tip' => 'Build on your previous answer. Provide additional context and specific details.',
            ],
        ]);
    }

    private function evaluateAnswer(string $answer, string $category): int
    {
        $wordCount = str_word_count($answer);
        $answerLower = strtolower($answer);
        $score = 0;

        // Base score from length
        if ($wordCount > 100) $score += 30;
        elseif ($wordCount > 50) $score += 20;
        elseif ($wordCount > 20) $score += 10;

        // Structure indicators
        if (preg_match('/first|second|finally|in conclusion|specifically|for example/i', $answer)) $score += 15;
        if (preg_match('/because|therefore|however|consequently/i', $answer)) $score += 10;

        // Category-specific scoring
        switch ($category) {
            case 'System Design':
            case 'Technical':
                if (preg_match('/scalab|architect|design pattern|microservice|api/i', $answer)) $score += 20;
                if (preg_match('/database|cache|load balanc|queue/i', $answer)) $score += 15;
                break;
            case 'Leadership':
            case 'Teamwork':
                if (preg_match('/team|lead|mentor|collaborat|communicat/i', $answer)) $score += 20;
                if (preg_match('/resolv|conflict|mediat|facilitat/i', $answer)) $score += 15;
                break;
            case 'Problem Solving':
                if (preg_match('/analyz|evaluat|approach|methodolog/i', $answer)) $score += 20;
                if (preg_match('/solved|resolv|solution|result|outcome/i', $answer)) $score += 15;
                break;
            default:
                if (preg_match('/result|achiev|improv|deliver|impact/i', $answer)) $score += 15;
                break;
        }

        // Metrics and quantifiable results
        if (preg_match('/\d+%|\d+x|\$\d+|\d+\s+(users|clients|customers|revenue|projects)/i', $answer)) $score += 20;

        // Confidence indicators
        if (!preg_match('/maybe|i think|perhaps|not sure/i', $answer)) $score += 10;
        if (preg_match('/i am|i have|i can|i will|i did/i', $answer)) $score += 10;

        return min($score + rand(0, 10), 95);
    }

    private function generateFeedback(string $answer): string
    {
        $wordCount = str_word_count($answer);
        $hasMetrics = preg_match('/\d+%|\d+x|\$\d+|\d+\s+(users|clients|customers)/i', $answer);
        $hasStructure = preg_match('/first|second|finally|in conclusion|specifically|for example/i', $answer);

        if ($wordCount > 50 && $hasMetrics && $hasStructure) {
            return self::AI_FEEDBACK_POSITIVE[array_rand(self::AI_FEEDBACK_POSITIVE)];
        } elseif ($wordCount > 30) {
            return self::AI_FEEDBACK_NEUTRAL[array_rand(self::AI_FEEDBACK_NEUTRAL)];
        } else {
            return self::AI_FEEDBACK_CONSTRUCTIVE[array_rand(self::AI_FEEDBACK_CONSTRUCTIVE)];
        }
    }

    private function generateReport(array $answers, Interview $interview): array
    {
        $totalQuestions = count($interview->questions ?? []);
        $answeredQuestions = count($answers);
        $totalDuration = array_sum(array_column($answers, 'duration_seconds'));

        // Calculate category scores
        $categoryScores = [];
        foreach ($answers as $answer) {
            $category = 'General';
            foreach ($interview->questions ?? [] as $q) {
                if ($q['id'] === $answer['question_id']) {
                    $category = $q['category'];
                    break;
                }
            }
            if (!isset($categoryScores[$category])) {
                $categoryScores[$category] = [];
            }
            $categoryScores[$category][] = $answer['score'];
        }

        $calculateMetric = function (string $metric) use ($answers): int {
            $scores = [];
            foreach ($answers as $a) {
                $text = strtolower($a['answer']);
                $wc = str_word_count($a['answer']);
                $s = 50;

                switch ($metric) {
                    case 'communication':
                        if (preg_match('/because|therefore|first|second|example|specifically/i', $text)) $s += 25;
                        if ($wc > 40) $s += 15;
                        break;
                    case 'confidence':
                        if ($wc > 50) $s += 20;
                        if (!preg_match('/maybe|i think|perhaps/i', $text)) $s += 20;
                        if (preg_match('/i am|i have|i can|i will/i', $text)) $s += 15;
                        break;
                    case 'technical':
                        if (preg_match('/algorithm|system|code|function|design|architect/i', $text)) $s += 30;
                        if (preg_match('/optimize|performance|scalab|database/i', $text)) $s += 20;
                        break;
                    case 'problem_solving':
                        if (preg_match('/approach|method|analyz|evaluat|solution|result/i', $text)) $s += 30;
                        if (preg_match('/solved|resolv|outcome|learned/i', $text)) $s += 20;
                        break;
                    case 'english':
                        $grammarWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'have', 'has', 'had'];
                        $hits = 0;
                        foreach ($grammarWords as $w) {
                            if (str_contains($text, $w)) $hits++;
                        }
                        $s += min($hits * 5, 30);
                        if ($wc > 30) $s += 15;
                        break;
                }
                $scores[] = min($s + rand(0, 10), 95);
            }
            return count($scores) > 0 ? (int) round(array_sum($scores) / count($scores)) : 50;
        };

        $communication = $calculateMetric('communication');
        $confidence = $calculateMetric('confidence');
        $technical = $calculateMetric('technical');
        $problemSolving = $calculateMetric('problem_solving');
        $english = $calculateMetric('english');
        $overall = (int) round(($communication + $confidence + $technical + $problemSolving + $english) / 5);

        $scores = [
            'communication' => $communication,
            'confidence' => $confidence,
            'technical' => $technical,
            'problem_solving' => $problemSolving,
            'english' => $english,
            'overall' => $overall,
        ];

        // Generate strengths and weaknesses
        $scoreMap = [
            'Communication' => $communication,
            'Technical Skills' => $technical,
            'Confidence' => $confidence,
            'Problem Solving' => $problemSolving,
            'English' => $english,
        ];
        arsort($scoreMap);
        $scoreKeys = array_keys($scoreMap);
        $strengths = [
            "Strong {$scoreKeys[0]} skills demonstrated throughout the interview",
            "Good {$scoreKeys[1]} abilities with clear examples",
        ];
        $weaknesses = [
            "Consider improving your {$scoreKeys[count($scoreKeys)-1]} skills with more practice",
            "Focus on developing stronger {$scoreKeys[count($scoreKeys)-2]} capabilities",
        ];

        $improvements = [
            "Use the STAR method more consistently for behavioral questions",
            "Include more quantifiable metrics and specific examples",
            "Practice active listening before responding to questions",
            "Structure answers with a clear beginning, middle, and end",
        ];

        $resources = [
            ['title' => 'Cracking the Coding Interview', 'url' => 'https://www.crackingthecodinginterview.com/'],
            ['title' => 'LeetCode - Practice Coding Problems', 'url' => 'https://leetcode.com/'],
            ['title' => 'System Design Interview - Alex Xu', 'url' => 'https://www.amazon.com/System-Design-Interview-Insiders-Guide/dp/1736049119'],
            ['title' => 'Interviewing.io - Practice with Peers', 'url' => 'https://interviewing.io/'],
            ['title' => 'Pramp - Free Mock Interviews', 'url' => 'https://www.pramp.com/'],
            ['title' => 'Big Interview - AI Interview Coach', 'url' => 'https://www.biginterview.com/'],
        ];

        $detailedFeedback = [];
        foreach ($scoreMap as $category => $score) {
            $comment = $score >= 80 ? "Excellent {$category} skills. You demonstrated great proficiency." :
                      ($score >= 60 ? "Good {$category} skills with room for improvement." :
                      "Your {$category} skills need more attention and practice.");
            $detailedFeedback[] = [
                'category' => $category,
                'score' => $score,
                'comment' => $comment,
            ];
        }

        return [
            'scores' => $scores,
            'report' => [
                'strengths' => $strengths,
                'weaknesses' => $weaknesses,
                'improvements' => $improvements,
                'resources' => $resources,
                'detailed_feedback' => $detailedFeedback,
                'total_questions' => $totalQuestions,
                'answered_questions' => $answeredQuestions,
                'duration_seconds' => $totalDuration,
            ],
        ];
    }
}