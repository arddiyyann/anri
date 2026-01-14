<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\Request;

class AdminReservationController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'status' => ['nullable', 'in:pending,approved,rejected,cancelled,done'],
        ]);

        $q = Reservation::query()
            ->with(['user', 'service'])
            ->latest();

        if ($request->filled('status')) {
            $q->where('status', $request->status);
        }

        return response()->json($q->get());
    }

    public function approve(Request $request, Reservation $reservation)
    {
        $data = $request->validate([
            'admin_note' => ['nullable', 'string'],

            'scheduled_start_at' => ['nullable', 'date'],
            'scheduled_end_at' => ['nullable', 'date', 'after:scheduled_start_at'],

            'meeting_link' => ['nullable', 'url'],
            'location' => ['nullable', 'string', 'max:255'],
        ]);

        if ($reservation->status !== 'pending') {
            return response()->json(['message' => 'Reservasi bukan status pending'], 422);
        }

        $scheduledStart = $data['scheduled_start_at'] ?? $reservation->requested_start_at;
        $scheduledEnd   = $data['scheduled_end_at'] ?? $reservation->requested_end_at;

        if (!$scheduledStart || !$scheduledEnd) {
            return response()->json([
                'message' => 'Jadwal final wajib (scheduled_start_at & scheduled_end_at).'
            ], 422);
        }

        $conflict = Reservation::query()
            ->where('id', '!=', $reservation->id)
            ->where('service_id', $reservation->service_id)
            ->where('mode', $reservation->mode)
            ->where('status', 'approved')
            ->where(function ($q) use ($scheduledStart, $scheduledEnd) {
                $q->where('scheduled_start_at', '<', $scheduledEnd)
                    ->where('scheduled_end_at', '>', $scheduledStart);
            })
            ->exists();

        if ($conflict) {
            return response()->json([
                'message' => 'Jadwal final bentrok dengan reservasi lain yang sudah approved.'
            ], 422);
        }

        $reservation->update([
            'status' => 'approved',
            'admin_note' => $data['admin_note'] ?? null,

            'scheduled_start_at' => $scheduledStart,
            'scheduled_end_at' => $scheduledEnd,

            'meeting_link' => $reservation->mode === 'online' ? ($data['meeting_link'] ?? null) : null,
            'location' => $reservation->mode === 'offline' ? ($data['location'] ?? null) : null,

            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        return response()->json(['message' => 'Approved']);
    }


    public function reject(Request $request, Reservation $reservation)
    {
        $data = $request->validate([
            'admin_note' => ['required', 'string'],
        ]);

        if ($reservation->status !== 'pending') {
            return response()->json(['message' => 'Reservasi bukan status pending'], 422);
        }

        $reservation->update([
            'status' => 'rejected',
            'admin_note' => $data['admin_note'],
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        return response()->json(['message' => 'Rejected']);
    }
}
