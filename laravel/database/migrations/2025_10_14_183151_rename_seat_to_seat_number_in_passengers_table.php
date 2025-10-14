<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('passengers', function (Blueprint $table) {
            $table->renameColumn('seat', 'seat_number');
        });
    }
    public function down(): void {
        Schema::table('passengers', function (Blueprint $table) {
            $table->renameColumn('seat_number', 'seat');
        });
    }
};
