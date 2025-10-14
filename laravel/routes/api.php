<?php

use App\Http\Controllers\AirportController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\FlightController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/airports', [AirportController::class, 'index']);
Route::get('/airports/{airport}', [AirportController::class, 'show']);
Route::get('/flights/search', [FlightController::class, 'search']);
Route::get('/flights/{flight}', [FlightController::class, 'show']);

Route::prefix('admin')->group(function () {
        // Airports
        Route::post('/airports', [AirportController::class, 'store']);
        Route::put('/airports/{airport}', [AirportController::class, 'update']);
        Route::delete('/airports/{airport}', [AirportController::class, 'destroy']);

        Route::post('/flights', [FlightController::class, 'store']);
        Route::put('/flights/{flight}', [FlightController::class, 'update']);
        Route::delete('/flights/{flight}', [FlightController::class, 'destroy']);


         Route::apiResource('bookings', BookingController::class);

        // akcija mimo REST-a
        Route::post('/bookings/{booking}/cancel', [BookingController::class, 'cancel']);
});