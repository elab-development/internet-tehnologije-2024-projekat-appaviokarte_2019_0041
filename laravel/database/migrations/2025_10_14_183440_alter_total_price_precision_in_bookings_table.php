<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('bookings', function (Blueprint $table) {
            // npr. sa (10,2) na (12,2)
            $table->decimal('total_price', 12, 2)->change();
        });
    }
    public function down(): void {
        Schema::table('bookings', function (Blueprint $table) {
            $table->decimal('total_price', 10, 2)->change();
        });
    }
};
