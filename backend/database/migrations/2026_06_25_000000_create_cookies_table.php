<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cookies', function (Blueprint $table) {
            $table->id();

            // If the user is authenticated we can store the consent against users.id
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();

            // If the user is not authenticated we can store consent for an anonymous visitor.
            // Use a UUID (generated client-side or server-side) to identify the browser/session.
            $table->uuid('anon_id')->nullable()->index();

            // Which cookie categories were accepted.
            // Example: {"necessary":true,"analytics":false,"marketing":false}
            $table->json('accepted_categories')->nullable();

            // Useful fallback (single boolean consent, e.g. "accepted all").
            $table->boolean('accepted')->default(false);

            $table->timestamp('consented_at')->useCurrent();
            $table->timestamps();

            // Avoid duplicate consent rows per user/anon identifier.
            $table->unique(['user_id', 'anon_id']);
        });
    }

    
    public function down(): void
    {
        Schema::dropIfExists('cookies');
    }
};

