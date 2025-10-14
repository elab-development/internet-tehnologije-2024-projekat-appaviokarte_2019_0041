<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Airport extends Model
{
    protected $fillable = ['code','name','city','country'];

    public function originatingFlights(): HasMany {
        return $this->hasMany(Flight::class, 'origin_airport_id');
    }

    public function destinationFlights(): HasMany {
        return $this->hasMany(Flight::class, 'destination_airport_id');
    }
}
