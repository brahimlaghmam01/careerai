<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::factory()->create([
            'name' => 'Demo User',
            'email' => 'demo@example.com',
            'password' => bcrypt('password'),
        ]);

        $user->documents()->create([
            'type' => 'cv',
            'name' => 'Software Engineer CV',
            'ats_score' => 85,
            'content' => json_encode(['experience' => '5 years']),
        ]);

        $user->documents()->create([
            'type' => 'letter',
            'name' => 'Cover Letter - Tech Corp',
            'ats_score' => 92,
            'content' => json_encode(['body' => 'Dear Hiring Manager...']),
        ]);
    }
}
