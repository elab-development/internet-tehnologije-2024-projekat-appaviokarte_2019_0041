<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Booking extends Model
{
    protected $fillable = [
        'user_id','flight_id','booking_code','status','total_price','booked_at'
    ];

    protected $casts = [
        'booked_at' => 'datetime',
    ];

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function flight(): BelongsTo {
        return $this->belongsTo(Flight::class);
    }

    public function passengers(): HasMany {
        return $this->hasMany(Passenger::class);
    }
}
