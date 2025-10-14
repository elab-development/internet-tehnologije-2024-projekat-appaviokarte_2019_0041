<?php

namespace App\Http\Controllers;

use App\Models\Flight;
use Illuminate\Http\Request;

class FlightController extends Controller
{
    // GET /api/flights/search?origin=BEG&destination=CDG&date=2025-10-20
    public function search(Request $request)
    {
        $data = $request->validate([
            'origin'      => 'nullable|string|max:8',
            'destination' => 'nullable|string|max:8',
            'date'        => 'nullable|date',
        ]);

        $flights = Flight::query()
            ->with(['origin','destination'])
            ->when(!empty($data['origin']), function ($qr) use ($data) {
                $qr->whereHas('origin', fn($q) => $q->where('code', $data['origin']));
            })
            ->when(!empty($data['destination']), function ($qr) use ($data) {
                $qr->whereHas('destination', fn($q) => $q->where('code', $data['destination']));
            })
            ->when(!empty($data['date']), function ($qr) use ($data) {
                $qr->whereDate('departure_at', $data['date']);
            })
            ->orderBy('departure_at')
            ->paginate(20);

        return response()->json($flights);
    }

    // GET /api/flights/{flight}
    public function show(Flight $flight)
    {
        $flight->load(['origin','destination']);
        return response()->json($flight);
    }

    // ADMIN: POST /api/admin/flights
    public function store(Request $request)
    {
        $data = $request->validate([
            'code'                  => 'required|string|max:50|unique:flights,code',
            'origin_airport_id'     => 'required|exists:airports,id',
            'destination_airport_id'=> 'required|different:origin_airport_id|exists:airports,id',
            'departure_at'          => 'required|date',
            'arrival_at'            => 'required|date|after:departure_at',
            'seats_total'           => 'required|integer|min:1',
            'seats_available'       => 'required|integer|min:0|lte:seats_total',
            'base_price'            => 'required|numeric|min:0',
        ]);

        $flight = Flight::create($data);
        return response()->json($flight, 201);
    }

    // ADMIN: PUT /api/admin/flights/{flight}
    public function update(Request $request, Flight $flight)
    {
        $data = $request->validate([
            'code'                  => 'sometimes|string|max:50|unique:flights,code,' . $flight->id,
            'origin_airport_id'     => 'sometimes|exists:airports,id',
            'destination_airport_id'=> 'sometimes|different:origin_airport_id|exists:airports,id',
            'departure_at'          => 'sometimes|date',
            'arrival_at'            => 'sometimes|date|after:departure_at',
            'seats_total'           => 'sometimes|integer|min:1',
            'seats_available'       => 'sometimes|integer|min:0',
            'base_price'            => 'sometimes|numeric|min:0',
        ]);

        $flight->update($data);
        return response()->json($flight);
    }

    // ADMIN: DELETE /api/admin/flights/{flight}
    public function destroy(Flight $flight)
    {
        $flight->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
