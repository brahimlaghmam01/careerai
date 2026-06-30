<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserProfileController extends Controller
{
    public function profile(Request $request)
    {
        $user = $request->user();
        $user->loadCount('documents as interviews_count');

        // Get user's documents (resumes)
        $documents = $user->documents()
            ->where('type', 'cv')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get(['id', 'name', 'type']);

        // Parse resume text from latest resume document
        $latestResume = $user->documents()
            ->where('type', 'cv')
            ->latest()
            ->first();

        $resumeText = '';
        $skills = [];
        $experienceYears = '';

        if ($latestResume && $latestResume->content) {
            $content = is_string($latestResume->content) 
                ? json_decode($latestResume->content, true) 
                : $latestResume->content;
            
            $resumeText = $content['summary'] ?? $content['content'] ?? '';
            $skills = $content['skills'] ?? [];
            $experienceYears = $content['experience_years'] ?? '';
        }

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'resume_text' => $resumeText,
                'skills' => $skills,
                'experience_years' => $experienceYears,
                'interviews_count' => $user->interviews()->count(),
                'documents' => $documents,
            ],
        ]);
    }
}