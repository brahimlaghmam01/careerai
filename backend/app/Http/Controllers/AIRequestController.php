<?php

namespace App\Http\Controllers;

use App\Models\AIRequest;
use Illuminate\Http\Request;

class AIRequestController extends Controller
{
    public function generateCV(Request $request)
    {
        $request->validate([
            'prompt' => 'required|string',
            'data' => 'required|array',
        ]);

        // Create a pending request
        $aiReq = $request->user()->aiRequests()->create([
            'prompt' => json_encode($request->data),
            'status' => 'pending',
        ]);

        // Build deterministic, ATS-friendly CV content (mocked AI)
        $data = $request->data;

        $fullName = $data['fullName'] ?? 'User';
        $targetJob = trim((string)($data['targetJob'] ?? ''));

        $skillsRaw = (string)($data['skills'] ?? '');
        $skillsList = array_values(array_filter(array_map('trim', preg_split('/,|\n|\r/', $skillsRaw))));

        $jobTokens = preg_split('/[^a-z0-9]+/i', strtolower($targetJob));
        $jobTokens = array_values(array_filter(array_map(fn($t) => trim($t), $jobTokens), fn($t) => strlen($t) >= 3));

        $education = trim((string)($data['education'] ?? ''));
        $certifications = trim((string)($data['certifications'] ?? ''));
        $projects = trim((string)($data['projects'] ?? ''));
        $achievements = trim((string)($data['achievements'] ?? ''));

        $experienceRaw = trim((string)($data['experience'] ?? ''));

        $summary = $targetJob
            ? "Results-driven professional targeting the " . $targetJob . " role. Strengths include delivering measurable outcomes, collaborating cross-functionally, and applying proven " . ($skillsRaw ?: 'industry practices') . " to drive business impact."
            : "Results-driven professional focused on delivering measurable outcomes and applying practical expertise to drive business impact.";

        // Experience: role + company + dates + bullets
        $experienceBlock = '';
        if ($experienceRaw !== '') {
            // Ensure plain text and keep user content, but prepend an ATS header if missing.
            $experienceBlock = preg_replace('/\r\n/', "\n", $experienceRaw);
            $roleForHeader = $targetJob ?: 'Your Role';

            $hasRole = str_contains($experienceBlock, 'Role:') || str_contains($experienceBlock, 'Company:') || str_contains($experienceBlock, 'Dates:');
            if (!$hasRole) {
                $experienceBlock = "Role: {$roleForHeader}\nCompany: Your Company\nDates: MM YYYY - MM YYYY\n\n" . $experienceBlock;
            }
        } else {
            $roleForHeader = $targetJob ?: 'Your Role';
            $experienceBlock = "Role: {$roleForHeader}\nCompany: Your Company\nDates: MM YYYY - MM YYYY\n\n- Delivered measurable outcomes by shipping features end-to-end (planning, execution, QA).\n- Improved performance and user experience by optimizing core workflows and monitoring KPIs.\n- Collaborated with cross-functional teams to align requirements and deliver on time.";
        }

        $skillsOptimized = $skillsRaw;
        if ($skillsOptimized === '' && !empty($skillsList)) {
            $skillsOptimized = implode(', ', $skillsList);
        }
        if ($skillsOptimized === '') {
            $skillsOptimized = $targetJob ? $targetJob : 'Problem solving, Communication, Teamwork';
        }

        // Projects: project name + status + description
        if ($projects !== '') {
            $projectsBlock = preg_replace('/\r\n/', "\n", $projects);
        } else {
            $projectsBlock = "Project: End-to-End {$targetJob} Dashboard\nStatus: MVP\nDescription: Built end-to-end features relevant to the target role using modern tools and best practices (UI, API integration, testing).\n\nProject: Performance & ATS-Ready Resume Optimizer\nStatus: Prototype\nDescription: Designed and implemented an ATS-friendly text generation flow, improving structured output and scanability for recruiters.";
        }

        // Education: start/end + school + filiere/major
        if ($education !== '') {
            $educationBlock = preg_replace('/\r\n/', "\n", $education);
        } else {
            $educationBlock = "Education: Bachelor/Master in Your Filière\nSchool: Your School\nStart Date - End Date: MM YYYY - MM YYYY";
        }

        $certBlock = $certifications !== ''
            ? preg_replace('/\r\n/', "\n", $certifications)
            : "Relevant certifications (optional but recommended).";

        $achievementsBlock = $achievements !== ''
            ? preg_replace('/\r\n/', "\n", $achievements)
            : "Increased efficiency, reduced errors, and delivered measurable improvements (add your quantified wins).";

        // Deterministic ATS score (0-100)
        $matchedKeywords = [];
        $skillsLower = array_map(fn($s) => strtolower($s), $skillsList);
        foreach ($jobTokens as $tok) {
            if ($tok && in_array($tok, $skillsLower, true)) {
                $matchedKeywords[] = $tok;
            }
        }

        // Section presence scoring
        $total = 4;
        $score = 0;
        $score += 1; // summary exists
        $score += (!empty($skillsList) || $skillsRaw !== '') ? 1 : 0;
        $score += ($experienceBlock !== '') ? 1 : 0;
        $score += (($educationBlock !== '' ? 1 : 0) + ($certBlock !== '' ? 1 : 0) + ($projectsBlock !== '' ? 1 : 0)) > 0 ? 1 : 0;

        $keywordBonus = 0;
        if (!empty($jobTokens)) {
            $keywordMatches = count(array_unique($matchedKeywords));
            $keywordBonus = min(30, (int)floor(($keywordMatches / max(1, count($jobTokens))) * 30));
        }

        $atsScore = (int)min(100, max(0, (int)floor(($score / $total) * 70) + $keywordBonus));

        $atsReasons = [];
        $atsReasons[] = 'ATS keywords matched: ' . (count($matchedKeywords) ?: 0) . '/' . max(1, count($jobTokens));
        $atsReasons[] = !empty($skillsList) ? 'Skills section detected.' : 'Skills section missing.';
        $atsReasons[] = $experienceBlock !== '' ? 'Experience section detected.' : 'Experience section missing.';
        $atsReasons[] = $educationBlock !== '' ? 'Education present.' : 'Education missing.';

        $contact = [
            'email' => trim((string)($data['email'] ?? '')) ?: null,
            'phone' => trim((string)($data['phone'] ?? '')) ?: null,
            'location' => trim((string)($data['location'] ?? '')) ?: null,
            'linkedin' => trim((string)($data['linkedin'] ?? '')) ?: null,
            'website' => trim((string)($data['website'] ?? '')) ?: null,
        ];

        $cleanContact = array_filter($contact, fn($v) => $v !== null && $v !== '');

        $mockedResponse = [
            'fullName' => $fullName,
            'contact' => $cleanContact,
            'summary' => $summary,
            'experience' => $experienceBlock,
            'skills' => 'Optimized Skills: ' . $skillsOptimized,
            'coreSkills' => array_slice($skillsList, 0, 12),

            // Preview expects an array of strings
            'projects' => preg_split('/\n{2,}/', trim($projectsBlock)),

            'achievements' => $achievementsBlock,
            'education' => $educationBlock,
            'certifications' => $certBlock,

            'ats_score' => $atsScore,
            'ats_reasons' => $atsReasons,
        ];

        $aiReq->update([
            'status' => 'completed',
            'response' => json_encode($mockedResponse),
        ]);

        return response()->json($aiReq);
    }
}

