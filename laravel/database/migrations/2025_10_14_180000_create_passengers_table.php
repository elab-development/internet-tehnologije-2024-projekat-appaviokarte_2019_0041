<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('passengers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnUpdate()->cascadeOnDelete();
            $table->string('first_name');
            $table->string('last_name');
            $table->date('date_of_birth')->nullable();
            $table->string('passport_number', 32)->nullable();
             $table->string('passenger_number', 32)->nullable();
            $table->string('seat')->nullable(); 
            $table->decimal('price', 10, 2)->default(0);
            $table->timestamps();

            $table->index(['booking_id','last_name']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('passengers');
    }
};
