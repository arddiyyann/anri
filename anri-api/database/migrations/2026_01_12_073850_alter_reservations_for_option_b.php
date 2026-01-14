<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {

            $table->dropForeign(['slot_id']);
            $table->unsignedBigInteger('slot_id')->nullable()->change();
            $table->foreign('slot_id')->references('id')->on('slots')->nullOnDelete();

            $table->dateTime('requested_start_at')->nullable()->after('mode');
            $table->dateTime('requested_end_at')->nullable()->after('requested_start_at');

            $table->dateTime('scheduled_start_at')->nullable()->after('requested_end_at');
            $table->dateTime('scheduled_end_at')->nullable()->after('scheduled_start_at');
        });

        DB::statement("
            UPDATE reservations r
            LEFT JOIN slots s ON s.id = r.slot_id
            SET
              r.requested_start_at = COALESCE(s.start_at, r.created_at),
              r.requested_end_at   = COALESCE(s.end_at,   r.created_at)
            WHERE r.requested_start_at IS NULL OR r.requested_end_at IS NULL
        ");
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn([
                'requested_start_at',
                'requested_end_at',
                'scheduled_start_at',
                'scheduled_end_at',
            ]);

            $table->dropForeign(['slot_id']);
            $table->unsignedBigInteger('slot_id')->nullable(false)->change();
            $table->foreign('slot_id')->references('id')->on('slots')->cascadeOnDelete();
        });
    }
};
