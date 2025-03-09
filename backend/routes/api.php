<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FriendshipController;
use App\Http\Controllers\BetController;
use App\Http\Controllers\UserController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::prefix('friends')->group(function () {
        Route::get('/', [FriendshipController::class, 'listFriends']);
        Route::get('/pending', [FriendshipController::class, 'pendingRequests']);
        Route::post('/request', [FriendshipController::class, 'sendRequest']);
        Route::post('/accept/{id}', [FriendshipController::class, 'acceptRequest']);
        Route::delete('/remove/{id}', [FriendshipController::class, 'removeFriend']);
    });
    Route::prefix('bets')->group(function () {
        Route::post('/', [BetController::class, 'store']);
        Route::get('/', [BetController::class, 'index']);
        Route::get('/{bet}', [BetController::class, 'show']);
        Route::put('/{bet}', [BetController::class, 'update']);
        Route::delete('/{bet}', [BetController::class, 'destroy']);
    });
    Route::get('/users/search', [UserController::class, 'search']);
});