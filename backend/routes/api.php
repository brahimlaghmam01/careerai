<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\AIRequestController;
use App\Http\Controllers\InterviewController;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\LiveKitController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    Route::apiResource('documents', DocumentController::class);

    Route::get('documents/{document}/download', [DocumentController::class, 'download']);

    Route::post('/generate/cv', [AIRequestController::class, 'generateCV']);

    // Interview routes
    Route::get('/interviews', [InterviewController::class, 'index']);
    Route::get('/interviews/{id}', [InterviewController::class, 'show']);
    Route::post('/interviews/start', [InterviewController::class, 'start']);
    Route::post('/interviews/answer', [InterviewController::class, 'submitAnswer']);
    Route::post('/interviews/follow-up', [InterviewController::class, 'followUp']);
    Route::post('/interviews/{id}/complete', [InterviewController::class, 'complete']);

    // User profile
    Route::get('/user/profile', [UserProfileController::class, 'profile']);

    // LiveKit
    Route::post('/livekit/token', [LiveKitController::class, 'token']);
});
