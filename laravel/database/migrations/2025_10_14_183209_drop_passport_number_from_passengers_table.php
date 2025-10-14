<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('passengers', function (Blueprint $table) {
            $table->dropColumn('passport_number');
        });
    }
    public function down(): void {
        Schema::table('passengers', function (Blueprint $table) {
            $table->string('passport_number', 32)->nullable();
        });
    }
};
