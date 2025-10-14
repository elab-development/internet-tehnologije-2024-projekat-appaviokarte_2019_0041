<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use App\Models\User;
use App\Models\Airport;
use App\Models\Flight;
use App\Models\Booking;
use App\Models\Passenger;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            // (opciono) očisti tabele redosledom zavisnosti
            Passenger::query()->delete();
            Booking::query()->delete();
            Flight::query()->delete();
            Airport::query()->delete();
            User::query()->whereIn('email', ['admin@example.com','ana@example.com'])->delete();

            /* -------- Users (2 uloge) -------- */
            $admin = User::create([
                'name'     => 'Admin',
                'email'    => 'admin@example.com',
                'password' => Hash::make('password'),
                'role'     => 'admin',
            ]);

            $customer = User::create([
                'name'     => 'Ana Customer',
                'email'    => 'ana@example.com',
                'password' => Hash::make('password'),
                'role'     => 'customer',
            ]);

            /* -------- Airports -------- */
            $beg = Airport::create([
                'code' => 'BEG',
                'name' => 'Belgrade Nikola Tesla',
                'city' => 'Belgrade',
                'country' => 'Serbia',
            ]);

            $cdg = Airport::create([
                'code' => 'CDG',
                'name' => 'Paris Charles de Gaulle',
                'city' => 'Paris',
                'country' => 'France',
            ]);

            $fra = Airport::create([
                'code' => 'FRA',
                'name' => 'Frankfurt am Main',
                'city' => 'Frankfurt',
                'country' => 'Germany',
            ]);

            /* -------- Flights -------- */
            $now = Carbon::now()->startOfHour();

            $flight1 = Flight::create([
                'code' => 'JU540',
                'origin_airport_id'      => $beg->id,
                'destination_airport_id' => $cdg->id,
                'departure_at'    => $now->copy()->addDays(2)->setTime(9, 30),
                'arrival_at'      => $now->copy()->addDays(2)->setTime(12, 05),
                'seats_total'     => 180,
                'seats_available' => 178,
                'base_price'      => 159.99,
            ]);

            $flight2 = Flight::create([
                'code' => 'LH1411',
                'origin_airport_id'      => $beg->id,
                'destination_airport_id' => $fra->id,
                'departure_at'    => $now->copy()->addDays(3)->setTime(7, 15),
                'arrival_at'      => $now->copy()->addDays(3)->setTime(9, 05),
                'seats_total'     => 200,
                'seats_available' => 197,
                'base_price'      => 129.50,
            ]);

            $flight3 = Flight::create([
                'code' => 'AF1795',
                'origin_airport_id'      => $fra->id,
                'destination_airport_id' => $cdg->id,
                'departure_at'    => $now->copy()->addDays(4)->setTime(13, 40),
                'arrival_at'      => $now->copy()->addDays(4)->setTime(15, 10),
                'seats_total'     => 150,
                'seats_available' => 150,
                'base_price'      => 99.00,
            ]);

            /* -------- Bookings -------- */
            $booking1 = Booking::create([
                'user_id'      => $customer->id,
                'flight_id'    => $flight1->id,
                'booking_code' => 'PNR123ABC',
                'status'       => 'confirmed',
                'total_price'  => 319.98,         // 2 putnika * (159.99)
                'booked_at'    => Carbon::now()->subDay(),
            ]);

            $booking2 = Booking::create([
                'user_id'      => $customer->id,
                'flight_id'    => $flight2->id,
                'booking_code' => 'PNR456XYZ',
                'status'       => 'pending',
                'total_price'  => 129.50,         // 1 putnik
                'booked_at'    => Carbon::now(),
            ]);

            // ažuriraj raspoloživa sedišta (ručno)
            $flight1->decrement('seats_available', 2);
            $flight2->decrement('seats_available', 1);

            /* -------- Passengers -------- */
            Passenger::create([
                'booking_id'      => $booking1->id,
                'first_name'      => 'Ana',
                'last_name'       => 'Petrović',
                'date_of_birth'   => '1998-04-12',
                'passport_number' => 'PA1234567',
                'seat_number'            => '12A',
                'price'           => 159.99,
            ]);

            Passenger::create([
                'booking_id'      => $booking1->id,
                'first_name'      => 'Marko',
                'last_name'       => 'Petrović',
                'date_of_birth'   => '1995-09-30',
                'passport_number' => 'PB7654321',
                'seat_number'            => '12B',
                'price'           => 159.99,
            ]);

            Passenger::create([
                'booking_id'      => $booking2->id,
                'first_name'      => 'Ana',
                'last_name'       => 'Petrović',
                'date_of_birth'   => '1998-04-12',
                'passport_number' => 'PA1234567',
                'seat_number'            => '7C',
                'price'           => 129.50,
            ]);
        });
    }
}
