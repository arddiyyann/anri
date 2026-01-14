<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Slot;
use Illuminate\Http\Request;

class AdminSlotController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'service_id' => ['nullable', 'integer', 'exists:services,id'],
            'mode' => ['nullable', 'in:online,offline'],
            'date' => ['nullable', 'date'],
            'status' => ['nullable', 'in:available,booked,closed'],
        ]);

        $q = Slot::query()->orderBy('start_at');

        if ($request->filled('service_id')) $q->where('service_id', $request->service_id);
        if ($request->filled('mode')) $q->where('mode', $request->mode);
        if ($request->filled('status')) $q->where('status', $request->status);
        if ($request->filled('date')) $q->whereDate('start_at', $request->date);

        return response()->json($q->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'service_id' => ['required', 'integer', 'exists:services,id'],
            'mode' => ['required', 'in:online,offline'],
            'start_at' => ['required', 'date'],
            'end_at' => ['required', 'date', 'after:start_at'],
            'status' => ['nullable', 'in:available,booked,closed'],
        ]);

        $slot = Slot::create([
            'service_id' => $data['service_id'],
            'mode' => $data['mode'],
            'start_at' => $data['start_at'],
            'end_at' => $data['end_at'],
            'status' => $data['status'] ?? 'available',
        ]);

        return response()->json($slot, 201);
    }

    public function show(Slot $slot)
    {
        return response()->json($slot);
    }

    public function update(Request $request, Slot $slot)
    {
        $data = $request->validate([
            'service_id' => ['sometimes', 'required', 'integer', 'exists:services,id'],
            'mode' => ['sometimes', 'required', 'in:online,offline'],
            'start_at' => ['sometimes', 'required', 'date'],
            'end_at' => ['sometimes', 'required', 'date', 'after:start_at'],
            'status' => ['nullable', 'in:available,booked,closed'],
        ]);

        $slot->update($data);

        return response()->json($slot);
    }

    public function destroy(Slot $slot)
    {
        $slot->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
