<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Slot;
use Illuminate\Http\Request;

class SlotController extends Controller
{
    public function index(Request $request)
    {
        $data = $request->validate([
            'service_id' => ['required', 'integer', 'exists:services,id'],
            'mode' => ['required', 'in:online,offline'],
            'date' => ['nullable', 'date'], // YYYY-MM-DD
        ]);
        $q = Slot::query()
            ->where('service_id', $data['service_id'])
            ->where('mode', $data['mode'])
            ->where('status', 'available')
            ->orderBy('start_at');

        if (!empty($data['date'])) {
            $q->whereDate('start_at', $data['date']);
        }

        return response()->json($q->get());
    }
}
