<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Passenger;
use App\Models\Flight;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PassengerController extends Controller
{
    // GET /api/bookings/{booking}/passengers
    public function index(Request $request, Booking $booking)
    {
        $user = $request->user();
        if (!$user->isAdmin() && $booking->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        return response()->json(
            $booking->passengers()->orderBy('last_name')->paginate(50)
        );
    }

    // GET /api/passengers/{passenger}
    public function show(Request $request, Passenger $passenger)
    {
        $user = $request->user();
        if (!$user->isAdmin() && $passenger->booking->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        return response()->json($passenger);
    }

    // POST /api/bookings/{booking}/passengers
    public function store(Request $request, Booking $booking)
    {
        $user = $request->user();
        if (!$user->isAdmin() && $booking->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        if ($booking->status === 'canceled') {
            return response()->json(['message' => 'Booking is canceled'], 422);
        }

        $data = $request->validate([
            'first_name'      => ['required','string','max:100'],
            'last_name'       => ['required','string','max:100'],
            'date_of_birth'   => ['nullable','date'],
            'passport_number' => ['nullable','string','max:32'],
            'seat'            => ['nullable','string','max:10'], // koristi 'seat_number' ako si rename uradila
            'price'           => ['required','numeric','min:0'],
        ]);

        return DB::transaction(function () use ($booking, $data) {
            $flight = Flight::lockForUpdate()->findOrFail($booking->flight_id);
            if ($flight->seats_available < 1) {
                return response()->json(['message' => 'Not enough seats'], 422);
            }

            $p = $booking->passengers()->create($data);

            // update flight seats + booking total
            $flight->decrement('seats_available', 1);
            $booking->update([
                'total_price' => DB::raw('total_price + ' . (float)$data['price'])
            ]);

            return response()->json($p, 201);
        });
    }

    // PUT/PATCH /api/passengers/{passenger}
    public function update(Request $request, Passenger $passenger)
    {
        $user = $request->user();
        $booking = $passenger->booking;
        if (!$user->isAdmin() && $booking->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        if ($booking->status === 'canceled') {
            return response()->json(['message' => 'Booking is canceled'], 422);
        }

        $data = $request->validate([
            'first_name'      => ['sometimes','string','max:100'],
            'last_name'       => ['sometimes','string','max:100'],
            'date_of_birth'   => ['nullable','date'],
            'passport_number' => ['nullable','string','max:32'],
            'seat'            => ['nullable','string','max:10'], // ili seat_number
            'price'           => ['sometimes','numeric','min:0'],
        ]);

        return DB::transaction(function () use ($passenger, $booking, $data) {
            $oldPrice = $passenger->price;
            $passenger->update($data);

            // ako je promenjena cena, ažuriraj total booking-a
            if (array_key_exists('price', $data)) {
                $diff = (float)$passenger->price - (float)$oldPrice;
                if ($diff != 0.0) {
                    $booking->update([
                        'total_price' => DB::raw('total_price + ' . $diff)
                    ]);
                }
            }

            return response()->json($passenger);
        });
    }

    // DELETE /api/passengers/{passenger}
    public function destroy(Request $request, Passenger $passenger)
    {
        $user = $request->user();
        $booking = $passenger->booking;
        if (!$user->isAdmin() && $booking->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return DB::transaction(function () use ($passenger, $booking) {
            $price = (float)$passenger->price;
            $flight = Flight::lockForUpdate()->findOrFail($booking->flight_id);

            // Ako rezervacija nije otkazana, vraćamo jedno sedište i smanjujemo total
            if ($booking->status !== 'canceled') {
                $flight->update([
                    'seats_available' => DB::raw('LEAST(seats_total, seats_available + 1)')
                ]);
                $booking->update([
                    'total_price' => DB::raw('GREATEST(0, total_price - ' . $price . ')')
                ]);
            }

            $passenger->delete();
            return response()->json(['message' => 'Deleted']);
        });
    }
}
