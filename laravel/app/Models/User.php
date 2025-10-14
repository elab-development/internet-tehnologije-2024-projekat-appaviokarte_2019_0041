<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use Notifiable;

    protected $fillable = [
        'name','email','password','role'
    ];

    protected $hidden = [
        'password','remember_token'
    ];

    // uloge
    public const ROLE_CUSTOMER = 'customer';
    public const ROLE_ADMIN    = 'admin';

    // relacije
    public function bookings(): HasMany {
        return $this->hasMany(Booking::class);
    }

    // pomoćni getter-i
    public function isAdmin(): bool   { return $this->role === self::ROLE_ADMIN; }
    public function isCustomer(): bool{ return $this->role === self::ROLE_CUSTOMER; }
}
