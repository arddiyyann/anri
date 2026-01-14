<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Slot extends Model
{
    protected $fillable = [
        'service_id',
        'mode',
        'start_at',
        'end_at',
        'status',
    ];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
