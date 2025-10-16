<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('flights', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // npr. JU540
            $table->foreignId('origin_airport_id')->constrained('airports')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('destination_airport_id')->constrained('airports')->cascadeOnUpdate()->restrictOnDelete();
            $table->dateTime('departure_at');
            $table->dateTime('arrival_at');
            $table->unsignedInteger('seats_total')->default(180);
            $table->unsignedInteger('seats_available')->default(180);
            $table->decimal('base_price', 10, 2);
            $table->timestamps();

            $table->index(['origin_airport_id', 'destination_airport_id']);
            $table->index('departure_at');
        });
    }

    public function down(): void {
        Schema::dropIfExists('flights');
    }
};
