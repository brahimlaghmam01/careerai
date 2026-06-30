<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class LiveKitController extends Controller
{
    public function token(Request $request)
    {
        $request->validate([
            'room_name' => 'required|string|max:255',
            'identity' => 'required|string|max:255',
        ]);

        $apiKey = config('services.livekit.api_key');
        $apiSecret = config('services.livekit.api_secret');

        if (!$apiKey || !$apiSecret) {
            return response()->json(['message' => 'LiveKit not configured'], 500);
        }

        $roomName = $request->room_name;
        $identity = $request->identity;
        $userId = $request->user()?->id ?? 0;

        $now = time();
        $payload = [
            'iss' => $apiKey,
            'iat' => $now,
            'exp' => $now + 3600,
            'sub' => $identity,
            'video' => [
                'room' => $roomName,
                'roomJoin' => true,
                'canPublish' => true,
                'canSubscribe' => true,
                'canPublishData' => true,
            ],
        ];

        $token = JWT::encode($payload, $apiSecret, 'HS256');

        return response()->json(['token' => $token]);
    }
}