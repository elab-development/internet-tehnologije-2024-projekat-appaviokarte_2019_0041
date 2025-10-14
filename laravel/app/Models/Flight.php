<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Flight extends Model
{
    protected $fillable = [
        'code','origin_airport_id','destination_airport_id',
        'departure_at','arrival_at','seats_total','seats_available','base_price'
    ];

    protected $casts = [
        'departure_at' => 'datetime',
        'arrival_at'   => 'datetime',
    ];

    public function origin(): BelongsTo {
        return $this->belongsTo(Airport::class, 'origin_airport_id');
    }

    public function destination(): BelongsTo {
        return $this->belongsTo(Airport::class, 'destination_airport_id');
    }

    public function bookings(): HasMany {
        return $this->hasMany(Booking::class);
    }
}
