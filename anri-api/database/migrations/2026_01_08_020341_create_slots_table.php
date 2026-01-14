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
        Schema::create('slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->enum('mode', ['online', 'offline']);
            $table->dateTime('start_at');
            $table->dateTime('end_at');
            $table->enum('status', ['available', 'booked', 'closed'])->default('available');
            $table->timestamps();

            $table->index(['service_id', 'mode', 'start_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('slots');
    }
};
