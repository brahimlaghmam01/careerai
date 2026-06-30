<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('interviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('type'); // hr, behavioral, technical, coding
            $table->string('status')->default('pending'); // pending, in_progress, completed, cancelled
            $table->text('resume_text')->nullable();
            $table->text('job_description')->nullable();
            $table->string('experience_years')->nullable();
            $table->json('skills')->nullable();
            $table->json('questions')->nullable();
            $table->json('answers')->nullable();
            $table->json('scores')->nullable();
            $table->json('report')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->integer('duration_seconds')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interviews');
    }
};