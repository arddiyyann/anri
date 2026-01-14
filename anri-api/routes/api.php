<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ServiceController;
use App\Http\Controllers\Api\V1\Admin\AdminServiceController;
use App\Http\Controllers\Api\V1\SlotController;
use App\Http\Controllers\Api\V1\Admin\AdminSlotController;
use App\Http\Controllers\Api\V1\ReservationController;
use App\Http\Controllers\Api\V1\Admin\AdminReservationController;



Route::prefix('v1')->group(function () {

    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);

    Route::get('services', [ServiceController::class, 'index']);

    Route::get('slots', [SlotController::class, 'index']);

    Route::middleware('auth:sanctum')->group(function () {

        Route::get('me', [AuthController::class, 'me']);
        Route::apiResource('reservations', ReservationController::class)->only(['index', 'store', 'show']);
        Route::post('auth/logout', [AuthController::class, 'logout']);

        Route::middleware('admin')->prefix('admin')->group(function () {
            Route::apiResource('services', AdminServiceController::class);
            Route::apiResource('slots', AdminSlotController::class);

            Route::get('reservations', [AdminReservationController::class, 'index']);
            Route::post('reservations/{reservation}/approve', [AdminReservationController::class, 'approve']);
            Route::post('reservations/{reservation}/reject', [AdminReservationController::class, 'reject']);
        });
    });
});
