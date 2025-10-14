<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('flight_id')->constrained('flights')->cascadeOnUpdate()->restrictOnDelete();
            $table->string('booking_code', 20)->unique(); // PNR
            $table->enum('status', ['pending','confirmed','canceled'])->default('pending');
            $table->decimal('total_price', 10, 2)->default(0);
            $table->dateTime('booked_at');
            $table->timestamps();

            $table->index(['user_id','flight_id']);
            $table->index('status');
        });
    }

    public function down(): void {
        Schema::dropIfExists('bookings');
    }
};
