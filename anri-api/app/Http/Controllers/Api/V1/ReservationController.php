<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $reservations = Reservation::query()
            ->where('user_id', $request->user()->id)
            ->with(['service'])
            ->latest()
            ->get();

        return response()->json($reservations);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'service_id' => ['required', 'integer', 'exists:services,id'],
            'mode' => ['required', 'in:online,offline'],
            'topic' => ['required', 'string', 'max:255'],
            'details' => ['nullable', 'string'],

            'requested_start_at' => ['required', 'date'],
            'requested_end_at' => ['required', 'date', 'after:requested_start_at'],

            'institution_name' => ['required', 'string', 'max:255'],
            'unit_name' => ['nullable', 'string', 'max:255'],
            'pic_name' => ['required', 'string', 'max:255'],
            'pic_phone' => ['required', 'string', 'max:30'],
            'pic_position' => ['nullable', 'string', 'max:255'],
        ]);

        $conflict = Reservation::query()
            ->where('user_id', $request->user()->id)
            ->whereIn('status', ['pending', 'approved'])
            ->where(function ($q) use ($data) {
                $q->where('requested_start_at', '<', $data['requested_end_at'])
                    ->where('requested_end_at', '>', $data['requested_start_at']);
            })
            ->exists();

        if ($conflict) {
            return response()->json([
                'message' => 'Jadwal yang diajukan bentrok dengan reservasi Anda yang masih pending/approved.'
            ], 422);
        }

        $reservation = Reservation::create([
            'user_id' => $request->user()->id,
            'service_id' => $data['service_id'],
            'slot_id' => null,

            'mode' => $data['mode'],
            'topic' => $data['topic'],
            'details' => $data['details'] ?? null,
            'status' => 'pending',

            'requested_start_at' => $data['requested_start_at'],
            'requested_end_at' => $data['requested_end_at'],

            'institution_name' => $data['institution_name'],
            'unit_name' => $data['unit_name'] ?? null,
            'pic_name' => $data['pic_name'],
            'pic_phone' => $data['pic_phone'],
            'pic_position' => $data['pic_position'] ?? null,
        ]);

        return response()->json($reservation->load(['service']), 201);
    }

    public function show(Request $request, Reservation $reservation)
    {
        if ($reservation->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($reservation->load(['service']));
    }
}
