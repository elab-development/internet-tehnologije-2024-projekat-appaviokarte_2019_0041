<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Flight;
use App\Models\Passenger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
class BookingController extends Controller
{
    // GET /api/bookings (customer: samo svoje, admin: sve)
    public function index(Request $request)
    {
        $user = $request->user();

        $q = Booking::query()
            ->with(['flight.origin','flight.destination','passengers'])
            ->when(!$user->isAdmin(), fn($qr) => $qr->where('user_id', $user->id))
            ->orderByDesc('booked_at');

        return response()->json($q->paginate(20));
    }

    // GET /api/bookings/{booking}
    public function show(Request $request, Booking $booking)
    {
        $user = $request->user();
        if (!$user->isAdmin() && $booking->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $booking->load(['flight.origin','flight.destination','passengers']);
        return response()->json($booking);
    }

    // POST /api/bookings  (kreira i putnike)
    // body: { flight_id, passengers: [{first_name,last_name,date_of_birth,passport_number,seat,price}, ...] }
    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'flight_id' => ['required','exists:flights,id'],
            'passengers' => ['required','array','min:1'],
            'passengers.*.first_name' => ['required','string','max:100'],
            'passengers.*.last_name'  => ['required','string','max:100'],
            'passengers.*.date_of_birth' => ['nullable','date'],
            'passengers.*.passport_number' => ['nullable','string','max:32'],
            'passengers.*.seat' => ['nullable','string','max:10'],
            'passengers.*.price' => ['required','numeric','min:0'],
        ]);

        return DB::transaction(function () use ($data, $user) {
            /** @var Flight $flight */
            $flight = Flight::lockForUpdate()->findOrFail($data['flight_id']);

            $count = count($data['passengers']);
            if ($flight->seats_available < $count) {
                return response()->json(['message' => 'Not enough seats'], 422);
            }

            $total = collect($data['passengers'])->sum('price');

            $booking = Booking::create([
                'user_id'      => $user->id,
                'flight_id'    => $flight->id,
               'booking_code' => 'PNR' . Str::upper(Str::random(6)),
                'status'       => 'confirmed',
                'total_price'  => $total,
                'booked_at'    => now(),
            ]);

            foreach ($data['passengers'] as $p) {
                Passenger::create([
                    'booking_id'      => $booking->id,
                    'first_name'      => $p['first_name'],
                    'last_name'       => $p['last_name'],
                    'date_of_birth'   => $p['date_of_birth'] ?? null,
                    'passport_number' => $p['passport_number'] ?? null,
                    'seat_number'            => $p['seat'] ?? null,  
                    'price'           => $p['price'],
                ]);
            }

            $flight->decrement('seats_available', $count);

            $booking->load(['flight.origin','flight.destination','passengers']);
            return response()->json($booking, 201);
        });
    }

    // POST /api/bookings/{booking}/cancel
    public function cancel(Request $request, Booking $booking)
    {
        $user = $request->user();
        if (!$user->isAdmin() && $booking->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($booking->status === 'canceled') {
            return response()->json(['message' => 'Already canceled'], 422);
        }

        return DB::transaction(function () use ($booking) {
            $paxCount = $booking->passengers()->count();
            $booking->update(['status' => 'canceled']);
            $booking->flight()->update([
                'seats_available' => DB::raw("LEAST(seats_total, seats_available + $paxCount)")
            ]);
            return response()->json(['message' => 'Canceled']);
        });
    }
}
