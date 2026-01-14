<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    protected $fillable = [
        'user_id',
        'service_id',
        'slot_id',
        'mode',
        'topic',
        'details',
        'status',
        'requested_start_at',
        'requested_end_at',
        'scheduled_start_at',
        'scheduled_end_at',
        'institution_name',
        'unit_name',
        'pic_name',
        'pic_phone',
        'pic_position',
        'admin_note',
        'meeting_link',
        'location',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'requested_start_at' => 'datetime',
        'requested_end_at' => 'datetime',
        'scheduled_start_at' => 'datetime',
        'scheduled_end_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function slot()
    {
        return $this->belongsTo(Slot::class);
    }
}
