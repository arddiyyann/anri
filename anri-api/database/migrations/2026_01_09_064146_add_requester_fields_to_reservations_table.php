<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->string('institution_name')->after('slot_id');
            $table->string('unit_name')->nullable()->after('institution_name');

            $table->string('pic_name')->after('unit_name');
            $table->string('pic_phone')->after('pic_name');
            $table->string('pic_position')->nullable()->after('pic_phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn([
                'institution_name',
                'unit_name',
                'pic_name',
                'pic_phone',
                'pic_position',
            ]);
        });
    }
};
