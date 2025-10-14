<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('passengers', function (Blueprint $table) {
            $table->dropColumn('passenger_number');
        });
    }
    public function down(): void {
        Schema::table('passengers', function (Blueprint $table) {
            $table->string('passenger_number', 32)->nullable();
        });
    }
};
