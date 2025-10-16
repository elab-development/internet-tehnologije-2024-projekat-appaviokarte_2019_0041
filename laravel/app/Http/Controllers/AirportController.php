<?php

namespace App\Http\Controllers;

use App\Models\Airport;
use Illuminate\Http\Request;

class AirportController extends Controller
{
    // GET /api/airports?q=beg
    public function index(Request $request)
    {
        $q = trim((string)$request->query('q', ''));
        $airports = Airport::query()
            ->when($q !== '', function ($qr) use ($q) {
                $qr->where('code', 'like', "%$q%")
                   ->orWhere('name', 'like', "%$q%")
                   ->orWhere('city', 'like', "%$q%")
                   ->orWhere('country', 'like', "%$q%");
            })
            ->orderBy('code')
            ->limit(100)
            ->get();

        return response()->json($airports);
    }

    // GET /api/airports/{id}
    public function show(Airport $airport)
    {
        return response()->json($airport);
    }

    // POST /api/admin/airports
    public function store(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string|max:8|unique:airports,code',
            'name' => 'required|string|max:255',
            'city' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
        ]);

        $airport = Airport::create($data);
        return response()->json($airport, 201);
    }

    // PUT /api/admin/airports/{airport}
    public function update(Request $request, Airport $airport)
    {
        $data = $request->validate([
            'code' => 'sometimes|string|max:8|unique:airports,code,' . $airport->id,
            'name' => 'sometimes|string|max:255',
            'city' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
        ]);

        $airport->update($data);
        return response()->json($airport);
    }

    // DELETE /api/admin/airports/{airport}
    public function destroy(Airport $airport)
    {
        $airport->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
