<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            $request->user()->documents()->latest()->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|string',
            'name' => 'required|string',
            'content' => 'nullable|array',
            'ats_score' => 'nullable|integer',
        ]);

        $document = $request->user()->documents()->create($request->all());

        return response()->json($document, 201);
    }

    public function show(Request $request, Document $document)
    {
        if ($document->user_id !== $request->user()->id) {
            abort(403);
        }

        return response()->json($document);
    }

    public function update(Request $request, Document $document)
    {
        if ($document->user_id !== $request->user()->id) {
            abort(403);
        }

        $document->update($request->all());

        return response()->json($document);
    }

    public function destroy(Request $request, Document $document)
    {
        if ($document->user_id !== $request->user()->id) {
            abort(403);
        }

        $document->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function download(Request $request, Document $document)
    {
        if ($document->user_id !== $request->user()->id) {
            abort(403);
        }

        $format = strtolower((string) $request->query('format', 'pdf'));
        if (!in_array($format, ['pdf', 'docx'], true)) {
            return response()->json(['message' => 'Invalid format. Use pdf or docx.'], 422);
        }

        $baseName = $document->name ?: ($document->type === 'cv' ? 'Resume' : 'Cover-Letter');
        $safeBaseName = preg_replace('/[^a-zA-Z0-9_\- ]+/', '', $baseName) ?: 'Document';

        $content = (array) $document->content;
        $text = '';

        if ($document->type === 'cv') {
            // AI CV preview structure
            $fullName = (string) ($content['fullName'] ?? '');
            $summary = (string) ($content['summary'] ?? '');
            $experience = (string) ($content['experience'] ?? '');
            $projects = is_array($content['projects'] ?? null) ? implode("\n\n", $content['projects']) : (string) ($content['projects'] ?? '');
            $skills = (string) ($content['skills'] ?? '');
            $achievements = (string) ($content['achievements'] ?? '');
            $education = (string) ($content['education'] ?? '');
            $certifications = (string) ($content['certifications'] ?? '');

            $contact = is_array($content['contact'] ?? null) ? $content['contact'] : [];
            $contactLine = '';
            if (!empty($contact)) {
                $contactLine = implode(' • ', array_values($contact));
            }

            $text = trim(
                implode("\n\n", array_filter([
                    $fullName ? $fullName : null,
                    $contactLine ? $contactLine : null,
                    $summary ? "SUMMARY\n" . $summary : null,
                    $skills ? "CORE SKILLS\n" . $skills : null,
                    $experience ? "EXPERIENCE\n" . $experience : null,
                    $projects ? "PROJECTS\n" . $projects : null,
                    $achievements ? "TOP ACHIEVEMENTS\n" . $achievements : null,
                    $education ? "EDUCATION\n" . $education : null,
                    $certifications ? "CERTIFICATIONS\n" . $certifications : null,
                ]))
            );
        } elseif ($document->type === 'letter') {
            $text = trim((string) (($content['body'] ?? null) ?: ''));
        } else {
            $text = trim(json_encode($content, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        }

        if ($format === 'pdf') {
            // Try Dompdf wrapper; if it's missing, fail explicitly.
            if (!class_exists(\Barryvdh\DomPDF\PDF::class) && !function_exists('public_path')) {
                return response()->json(['message' => 'PDF generation library is not available (dompdf).'], 500);
            }

            try {
                $html = "<!doctype html><html><head><meta charset='utf-8'><style>body{font-family: DejaVu Sans, Arial; white-space: pre-wrap; line-height:1.4; padding:40px;} h1{font-size:22px;margin:0 0 12px;} .small{color:#555;font-size:12px;}</style></head><body>";
                $html .= "<pre style='font-size:12.5px;margin:0;'>" . htmlspecialchars($text, ENT_QUOTES, 'UTF-8') . "</pre>";
                $html .= "</body></html>";

                $pdf = app()->make(\Barryvdh\DomPDF\PDF::class);
                $pdf->loadHTML($html);

                $filename = $safeBaseName . '.pdf';
                return $pdf->download($filename);
            } catch (\Throwable $e) {
                return response()->json(['message' => 'PDF generation failed.', 'error' => $e->getMessage()], 500);
            }
        }

        // DOCX generation with PhpWord
        try {
            if (!class_exists(\PhpOffice\PhpWord\PhpWord::class)) {
                return response()->json(['message' => 'DOCX generation library is not available (phpword).'], 500);
            }

            $phpWord = new \PhpOffice\PhpWord\PhpWord();
            $section = $phpWord->addSection();

            $fontStyle = [
                'name' => 'Calibri',
                'size' => 11,
            ];

            $paragraphStyle = ['spaceAfter' => 120];

            $lines = preg_split('/\r\n|\n|\r/', $text);
            foreach ($lines as $line) {
                $line = (string) $line;
                $section->addText($line, $fontStyle, $paragraphStyle);
            }

            $tmpDir = storage_path('app/tmp');
            if (!is_dir($tmpDir)) {
                mkdir($tmpDir, 0777, true);
            }
            $tmpFile = $tmpDir . '/' . $safeBaseName . '_' . $document->id . '.docx';

            $writer = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'Word2007');
            $writer->save($tmpFile);

            return response()->download($tmpFile, $safeBaseName . '.docx')->deleteFileAfterSend(true);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'DOCX generation failed.', 'error' => $e->getMessage()], 500);
        }
    }
}

