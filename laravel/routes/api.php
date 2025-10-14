<?php

use App\Http\Controllers\AirportController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/airports', [AirportController::class, 'index']);
Route::get('/airports/{airport}', [AirportController::class, 'show']);


Route::prefix('admin')->group(function () {
        // Airports
        Route::post('/airports', [AirportController::class, 'store']);
        Route::put('/airports/{airport}', [AirportController::class, 'update']);
        Route::delete('/airports/{airport}', [AirportController::class, 'destroy']);

       
});