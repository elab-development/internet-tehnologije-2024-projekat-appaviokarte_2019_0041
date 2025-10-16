<?php

use App\Http\Controllers\AirportController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\FlightController;
use App\Http\Controllers\PassengerController;
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


       
});


Route::post('/register', [AuthController::class, 'register'])->name('auth.register');
Route::post('/login',    [AuthController::class, 'login'])->name('auth.login');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me',           [AuthController::class, 'me'])->name('auth.me');
    Route::post('/logout',      [AuthController::class, 'logout'])->name('auth.logout'); 
});

Route::middleware('auth:sanctum')->group(function () {
      Route::apiResource('bookings', BookingController::class);

        // akcija mimo REST-a
        Route::post('/bookings/{booking}/cancel', [BookingController::class, 'cancel']);
    // nested listing/kreiranje (vezano za konkretan booking)
    Route::apiResource('bookings.passengers', PassengerController::class)
        ->only(['index','store'])
        ->shallow(); // -> /passengers/{passenger} za show/update/destroy

    // pojedinačni putnik (show/update/destroy)
    Route::apiResource('passengers', PassengerController::class)
        ->only(['show','update','destroy']);
});