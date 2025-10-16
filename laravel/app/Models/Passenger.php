<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Passenger extends Model
{
    protected $fillable = [
        'booking_id','first_name','last_name','date_of_birth',
        'passport_number','seat','price'
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    public function booking(): BelongsTo {
        return $this->belongsTo(Booking::class);
    }
}
