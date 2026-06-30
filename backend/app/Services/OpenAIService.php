<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenAIService
{
    private string $apiKey;
    private string $baseUrl = 'https://api.openai.com/v1';

    public function __construct()
    {
        $this->apiKey = config('services.openai.api_key');
    }

    public function generateQuestions(array $userData, string $type, ?string $jobDescription = null): array
    {
        $prompt = $this->buildQuestionPrompt($userData, $type, $jobDescription);
        
        $response = Http::withToken($this->apiKey)
            ->timeout(30)
            ->post("{$this->baseUrl}/chat/completions", [
                'model' => 'gpt-4o',
                'messages' => [
                    ['role' => 'system', 'content' => 'You are an expert technical interviewer. Generate personalized interview questions based on the candidate\'s profile. Return ONLY valid JSON.'],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'temperature' => 0.7,
                'max_tokens' => 2000,
                'response_format' => ['type' => 'json_object'],
            ]);

        if (!$response->successful()) {
            Log::error('OpenAI question generation failed', [
                'status' => $response->status(),
                'error' => $response->body(),
            ]);
            return $this->getFallbackQuestions($type);
        }

        $data = $response->json();
        $content = json_decode($data['choices'][0]['message']['content'] ?? '{}', true);
        
        return $content['questions'] ?? $this->getFallbackQuestions($type);
    }

    public function evaluateAnswer(string $question, string $answer, string $category, array $userData): array
    {
        $prompt = "Question: {$question}\n\nCandidate Answer: {$answer}\n\nCategory: {$category}\n\n";
        $prompt .= "Evaluate this interview answer and return a JSON object with:\n";
        $prompt .= "- score (0-100)\n";
        $prompt .= "- communication_score (0-100)\n";
        $prompt .= "- confidence_score (0-100)\n";
        $prompt .= "- technical_score (0-100)\n";
        $prompt .= "- problem_solving_score (0-100)\n";
        $prompt .= "- feedback (2-3 sentences of constructive feedback)\n";
        $prompt .= "- strengths (array of 1-2 specific strengths shown)\n";
        $prompt .= "- weaknesses (array of 1-2 areas to improve)\n";
        $prompt .= "- follow_up_question (a natural follow-up question based on their answer)\n";
        $prompt .= "- key_missed_points (array of important points they missed)\n";
        $prompt .= "- eye_contact_estimate (estimated eye contact quality: poor/average/good)\n";
        $prompt .= "- confidence_estimate (estimated confidence level: low/medium/high)";

        $response = Http::withToken($this->apiKey)
            ->timeout(15)
            ->post("{$this->baseUrl}/chat/completions", [
                'model' => 'gpt-4o',
                'messages' => [
                    ['role' => 'system', 'content' => 'You are an expert interview evaluator. Analyze answers critically and provide honest, constructive feedback. Return ONLY valid JSON.'],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'temperature' => 0.5,
                'max_tokens' => 1000,
                'response_format' => ['type' => 'json_object'],
            ]);

        if (!$response->successful()) {
            Log::error('OpenAI evaluation failed', ['status' => $response->status()]);
            return $this->getFallbackEvaluation($answer);
        }

        $data = $response->json();
        return json_decode($data['choices'][0]['message']['content'] ?? '{}', true) ?? $this->getFallbackEvaluation($answer);
    }

    public function generateFollowUp(string $question, string $answer, array $conversationHistory): string
    {
        $history = array_map(fn($h) => "Q: {$h['question']}\nA: {$h['answer']}", $conversationHistory);
        $historyStr = implode("\n\n", $history);
        
        $prompt = "Interview so far:\n{$historyStr}\n\n";
        $prompt .= "Last question: {$question}\n";
        $prompt .= "Last answer: {$answer}\n\n";
        $prompt .= "Generate ONE natural follow-up question that digs deeper into their response. ";
        $prompt .= "The question should be conversational and show you were listening. ";
        $prompt .= "Return ONLY the question text, no JSON.";

        $response = Http::withToken($this->apiKey)
            ->timeout(10)
            ->post("{$this->baseUrl}/chat/completions", [
                'model' => 'gpt-4o',
                'messages' => [
                    ['role' => 'system', 'content' => 'You are an expert interviewer asking intelligent follow-up questions. Be natural and conversational.'],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'temperature' => 0.8,
                'max_tokens' => 200,
            ]);

        if (!$response->successful()) {
            return "That's interesting. Can you tell me more about the specific impact your work had?";
        }

        return $response->json()['choices'][0]['message']['content'] ?? "Can you elaborate on that further?";
    }

    public function generateReport(array $answers, array $questions, array $userData): array
    {
        $answersSummary = array_map(fn($a) => [
            'question' => $a['question'] ?? '',
            'answer' => $a['answer'] ?? '',
            'score' => $a['score'] ?? 0,
        ], $answers);

        $prompt = json_encode([
            'candidate' => [
                'name' => $userData['name'] ?? 'Candidate',
                'skills' => $userData['skills'] ?? [],
                'experience' => $userData['experience_years'] ?? '',
            ],
            'answers' => $answersSummary,
            'total_questions' => count($questions),
            'answered_questions' => count($answers),
        ]);

        $systemPrompt = "You are an expert interview analyst. Generate a comprehensive interview report. ";
        $systemPrompt .= "Return ONLY valid JSON with this structure:\n";
        $systemPrompt .= "{\n";
        $systemPrompt .= '  "scores": { "communication": 0-100, "confidence": 0-100, "technical": 0-100, "problem_solving": 0-100, "english": 0-100, "overall": 0-100 },\n';
        $systemPrompt .= '  "report": {\n';
        $systemPrompt .= '    "strengths": ["strength1", "strength2"],\n';
        $systemPrompt .= '    "weaknesses": ["weakness1", "weakness2"],\n';
        $systemPrompt .= '    "improvements": ["improvement1", "improvement2", "improvement3", "improvement4"],\n';
        $systemPrompt .= '    "resources": [{"title": "Resource Name", "url": "https://..."}],\n';
        $systemPrompt .= '    "detailed_feedback": [{"category": "Communication", "score": 85, "comment": "..."}]\n';
        $systemPrompt .= '  }\n';
        $systemPrompt .= '}';

        $response = Http::withToken($this->apiKey)
            ->timeout(30)
            ->post("{$this->baseUrl}/chat/completions", [
                'model' => 'gpt-4o',
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => "Generate a detailed interview report based on this data:\n\n{$prompt}"],
                ],
                'temperature' => 0.5,
                'max_tokens' => 2000,
                'response_format' => ['type' => 'json_object'],
            ]);

        if (!$response->successful()) {
            Log::error('OpenAI report generation failed', ['status' => $response->status()]);
            return $this->getFallbackReport($answers, $questions);
        }

        $data = $response->json();
        $result = json_decode($data['choices'][0]['message']['content'] ?? '{}', true);
        
        return [
            'scores' => $result['scores'] ?? $this->calculateLocalScores($answers),
            'report' => $result['report'] ?? $this->getFallbackReportData($answers),
        ];
    }

    public function analyzeScreenShare(string $imageBase64): array
    {
        $response = Http::withToken($this->apiKey)
            ->timeout(15)
            ->post("{$this->baseUrl}/chat/completions", [
                'model' => 'gpt-4o',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are an expert interviewer analyzing a candidate\'s shared screen. It could be code, a portfolio, a presentation, or a project. Provide constructive feedback and ask relevant questions. Return ONLY valid JSON with: content_type (code/portfolio/presentation/other), description, feedback, questions_to_ask (array of 2-3 questions)',
                    ],
                    [
                        'role' => 'user',
                        'content' => [
                            ['type' => 'text', 'text' => 'Analyze this shared screen content from a job interview:'],
                            ['type' => 'image_url', 'image_url' => ['url' => "data:image/jpeg;base64,{$imageBase64}", 'detail' => 'high']],
                        ],
                    ],
                ],
                'max_tokens' => 1000,
                'response_format' => ['type' => 'json_object'],
            ]);

        if (!$response->successful()) {
            return [
                'content_type' => 'unknown',
                'description' => 'Could not analyze screen content',
                'feedback' => 'The screen content could not be analyzed at this time.',
                'questions_to_ask' => ['Can you walk me through what you\'re showing on your screen?'],
            ];
        }

        $data = $response->json();
        return json_decode($data['choices'][0]['message']['content'] ?? '{}', true) ?? [];
    }

    public function analyzeVideoFrame(string $imageBase64): array
    {
        $response = Http::withToken($this->apiKey)
            ->timeout(10)
            ->post("{$this->baseUrl}/chat/completions", [
                'model' => 'gpt-4o',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are an expert interviewer analyzing a candidate\'s video feed during an interview. Assess their body language, eye contact, confidence, and professionalism. Return ONLY valid JSON with: eye_contact (poor/average/good), confidence (low/medium/high), body_language (negative/neutral/positive), facial_expression, overall_impression, suggestions (array of 1-2 improvement tips)',
                    ],
                    [
                        'role' => 'user',
                        'content' => [
                            ['type' => 'text', 'text' => 'Analyze this video frame from a job interview candidate:'],
                            ['type' => 'image_url', 'image_url' => ['url' => "data:image/jpeg;base64,{$imageBase64}", 'detail' => 'high']],
                        ],
                    ],
                ],
                'max_tokens' => 500,
                'response_format' => ['type' => 'json_object'],
            ]);

        if (!$response->successful()) {
            return [
                'eye_contact' => 'unknown',
                'confidence' => 'unknown',
                'body_language' => 'neutral',
                'facial_expression' => 'neutral',
                'overall_impression' => 'Could not analyze video frame',
                'suggestions' => ['Ensure you are looking at the camera and have good lighting.'],
            ];
        }

        $data = $response->json();
        return json_decode($data['choices'][0]['message']['content'] ?? '{}', true) ?? [];
    }

    private function buildQuestionPrompt(array $userData, string $type, ?string $jobDescription): string
    {
        $name = $userData['name'] ?? 'the candidate';
        $skills = implode(', ', $userData['skills'] ?? ['various']);
        $experience = $userData['experience_years'] ?? 'some';
        $resume = $userData['resume_text'] ?? '';
        $previousInterviews = $userData['previous_interviews'] ?? [];
        $education = $userData['education'] ?? [];
        $projects = $userData['projects'] ?? [];

        $prompt = "Generate 5 personalized interview questions for {$name}.\n\n";
        $prompt .= "Profile:\n";
        $prompt .= "- Name: {$name}\n";
        $prompt .= "- Skills: {$skills}\n";
        $prompt .= "- Experience: {$experience} years\n";
        
        if (!empty($resume)) {
            $prompt .= "- Resume Summary: " . substr($resume, 0, 500) . "\n";
        }
        
        if (!empty($education)) {
            $edu = is_array($education) ? implode(', ', $education) : $education;
            $prompt .= "- Education: {$edu}\n";
        }
        
        if (!empty($projects)) {
            $proj = is_array($projects) ? implode('; ', array_slice($projects, 0, 3)) : $projects;
            $prompt .= "- Key Projects: {$proj}\n";
        }

        if (!empty($previousInterviews)) {
            $prompt .= "- Previous interview performance: " . json_encode(array_slice($previousInterviews, -2)) . "\n";
            $prompt .= "Note: Focus on areas that need improvement based on previous interviews.\n";
        }

        if ($jobDescription) {
            $prompt .= "\nJob Description: " . substr($jobDescription, 0, 1000) . "\n";
            $prompt .= "Tailor questions specifically for this role.\n";
        }

        $prompt .= "\nInterview Type: {$type}\n";
        $prompt .= "\nReturn a JSON object with a 'questions' array. Each question must have:\n";
        $prompt .= "- question: the interview question (address the candidate by their first name naturally)\n";
        $prompt .= "- category: the skill category being tested\n";
        $prompt .= "- difficulty: easy/medium/hard\n";
        $prompt .= "- tip: a helpful tip for answering this question\n";
        $prompt .= "- expected_keywords: array of 3-5 keywords/concepts a good answer should include\n";
        $prompt .= "- follow_up_potential: boolean indicating if this question can lead to good follow-ups\n";
        $prompt .= "\nMake questions specific to {$name}'s background. Use their name naturally in the questions.";

        return $prompt;
    }

    private function getFallbackQuestions(string $type): array
    {
        $base = [
            'hr' => [
                ['question' => 'Tell me about yourself and your professional background.', 'category' => 'Introduction', 'difficulty' => 'easy', 'tip' => 'Keep it concise, 2-3 minutes max.', 'expected_keywords' => ['experience', 'background', 'career'], 'follow_up_potential' => true],
                ['question' => 'Why are you interested in this position?', 'category' => 'Motivation', 'difficulty' => 'easy', 'tip' => 'Connect the company mission to your goals.', 'expected_keywords' => ['company', 'role', 'growth'], 'follow_up_potential' => true],
                ['question' => 'What are your salary expectations?', 'category' => 'Negotiation', 'difficulty' => 'medium', 'tip' => 'Give a range based on market research.', 'expected_keywords' => ['market', 'value', 'experience'], 'follow_up_potential' => false],
                ['question' => 'Where do you see yourself in 5 years?', 'category' => 'Career Growth', 'difficulty' => 'medium', 'tip' => 'Show ambition aligned with company growth.', 'expected_keywords' => ['growth', 'leadership', 'goals'], 'follow_up_potential' => true],
                ['question' => 'Why should we hire you?', 'category' => 'Self-Promotion', 'difficulty' => 'hard', 'tip' => 'Highlight 2-3 key differentiators.', 'expected_keywords' => ['unique', 'skills', 'value'], 'follow_up_potential' => false],
            ],
            'behavioral' => [
                ['question' => 'Tell me about a time you faced a major challenge and how you overcame it.', 'category' => 'Problem Solving', 'difficulty' => 'medium', 'tip' => 'Use the STAR method.', 'expected_keywords' => ['challenge', 'solution', 'result'], 'follow_up_potential' => true],
                ['question' => 'Describe a situation with a difficult team member.', 'category' => 'Teamwork', 'difficulty' => 'medium', 'tip' => 'Focus on professionalism and resolution.', 'expected_keywords' => ['conflict', 'communication', 'resolution'], 'follow_up_potential' => true],
                ['question' => 'Tell me about a project you led.', 'category' => 'Leadership', 'difficulty' => 'hard', 'tip' => 'Quantify impact with metrics.', 'expected_keywords' => ['lead', 'team', 'outcome'], 'follow_up_potential' => true],
                ['question' => 'Describe a time you met a tight deadline.', 'category' => 'Time Management', 'difficulty' => 'medium', 'tip' => 'Show prioritization and communication.', 'expected_keywords' => ['deadline', 'priority', 'delivered'], 'follow_up_potential' => true],
                ['question' => 'Tell me about a mistake you made.', 'category' => 'Accountability', 'difficulty' => 'medium', 'tip' => 'Be honest and show what you learned.', 'expected_keywords' => ['mistake', 'responsibility', 'learned'], 'follow_up_potential' => true],
            ],
            'technical' => [
                ['question' => 'Walk me through designing a scalable web application.', 'category' => 'System Design', 'difficulty' => 'hard', 'tip' => 'Start with requirements, discuss trade-offs.', 'expected_keywords' => ['scalability', 'caching', 'database'], 'follow_up_potential' => true],
                ['question' => 'Explain REST vs GraphQL APIs.', 'category' => 'API Design', 'difficulty' => 'medium', 'tip' => 'Use concrete examples.', 'expected_keywords' => ['REST', 'GraphQL', 'endpoints'], 'follow_up_potential' => true],
                ['question' => 'How do you ensure code quality?', 'category' => 'Best Practices', 'difficulty' => 'medium', 'tip' => 'Mention specific tools and processes.', 'expected_keywords' => ['testing', 'review', 'CI/CD'], 'follow_up_potential' => true],
                ['question' => 'Describe your database experience.', 'category' => 'Database', 'difficulty' => 'medium', 'tip' => 'Discuss specific projects.', 'expected_keywords' => ['SQL', 'NoSQL', 'schema'], 'follow_up_potential' => true],
                ['question' => 'How do you stay updated with technology?', 'category' => 'Learning', 'difficulty' => 'easy', 'tip' => 'Be specific about resources.', 'expected_keywords' => ['learning', 'courses', 'blogs'], 'follow_up_potential' => false],
            ],
            'coding' => [
                ['question' => 'Find the longest substring without repeating characters.', 'category' => 'Algorithms', 'difficulty' => 'hard', 'tip' => 'Start with brute force, then optimize.', 'expected_keywords' => ['sliding window', 'hash map', 'O(n)'], 'follow_up_potential' => true],
                ['question' => 'Implement a debounce function.', 'category' => 'JavaScript', 'difficulty' => 'medium', 'tip' => 'Explain use case first.', 'expected_keywords' => ['debounce', 'timer', 'callback'], 'follow_up_potential' => true],
                ['question' => 'Design a URL shortening service.', 'category' => 'System Design', 'difficulty' => 'hard', 'tip' => 'Discuss hashing and database schema.', 'expected_keywords' => ['hashing', 'database', 'redirection'], 'follow_up_potential' => true],
                ['question' => 'Check if a binary tree is balanced.', 'category' => 'Data Structures', 'difficulty' => 'medium', 'tip' => 'Define balanced first.', 'expected_keywords' => ['recursion', 'height', 'balanced'], 'follow_up_potential' => true],
                ['question' => 'Implement Promise.all().', 'category' => 'Concurrency', 'difficulty' => 'medium', 'tip' => 'Handle resolve and reject.', 'expected_keywords' => ['Promise', 'async', 'resolve'], 'follow_up_potential' => true],
            ],
        ];

        return $base[$type] ?? $base['behavioral'];
    }

    private function getFallbackEvaluation(string $answer): array
    {
        $wordCount = str_word_count($answer);
        $wordBonus = ($wordCount > 50) ? 20 : (($wordCount > 20) ? 10 : 0);
        $score = min(50 + $wordBonus + (preg_match('/\d+%|\$\d+/', $answer) ? 15 : 0), 90);
        
        return [
            'score' => $score,
            'communication_score' => min($score + 5, 95),
            'confidence_score' => min($score - 5, 90),
            'technical_score' => $score,
            'problem_solving_score' => $score,
            'feedback' => $wordCount > 50 ? "Good answer with solid detail. Try to include more specific metrics." : "Good start, but try to provide more specific examples and quantify your impact.",
            'strengths' => ['Clear communication', 'Relevant experience'],
            'weaknesses' => ['Could include more specific metrics', 'Consider structuring with STAR method'],
            'follow_up_question' => 'Can you tell me more about the specific impact your work had?',
            'key_missed_points' => ['Quantifiable results', 'Specific technologies used'],
            'eye_contact_estimate' => 'average',
            'confidence_estimate' => 'medium',
        ];
    }

    private function calculateLocalScores(array $answers): array
    {
        $scores = array_column($answers, 'score');
        $avg = count($scores) > 0 ? array_sum($scores) / count($scores) : 70;
        return [
            'communication' => (int) round($avg),
            'confidence' => (int) round(max(50, $avg - 5)),
            'technical' => (int) round($avg),
            'problem_solving' => (int) round($avg),
            'english' => (int) round(min(95, $avg + 10)),
            'overall' => (int) round($avg),
        ];
    }

    private function getFallbackReportData(array $answers): array
    {
        return [
            'strengths' => ['Good communication skills', 'Relevant experience demonstrated'],
            'weaknesses' => ['Consider providing more specific examples', 'Work on structuring answers'],
            'improvements' => ['Use the STAR method consistently', 'Include quantifiable metrics', 'Practice active listening', 'Structure answers clearly'],
            'resources' => [
                ['title' => 'Cracking the Coding Interview', 'url' => 'https://www.crackingthecodinginterview.com/'],
                ['title' => 'LeetCode', 'url' => 'https://leetcode.com/'],
                ['title' => 'System Design Interview', 'url' => 'https://www.amazon.com/System-Design-Interview-Insiders-Guide/dp/1736049119'],
                ['title' => 'Pramp - Free Mock Interviews', 'url' => 'https://www.pramp.com/'],
            ],
            'detailed_feedback' => [
                ['category' => 'Communication', 'score' => 75, 'comment' => 'Good communication with room for improvement.'],
                ['category' => 'Technical Skills', 'score' => 70, 'comment' => 'Solid technical foundation.'],
                ['category' => 'Confidence', 'score' => 65, 'comment' => 'Show more confidence in your answers.'],
                ['category' => 'Problem Solving', 'score' => 70, 'comment' => 'Good analytical approach.'],
                ['category' => 'English', 'score' => 80, 'comment' => 'Clear and professional language.'],
            ],
        ];
    }

    private function getFallbackReport(array $answers, array $questions): array
    {
        $scores = $this->calculateLocalScores($answers);
        return [
            'scores' => $scores,
            'report' => $this->getFallbackReportData($answers),
        ];
    }
}