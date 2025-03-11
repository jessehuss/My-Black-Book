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

    // Bet Management Routes
    Route::get('/bets', [App\Http\Controllers\API\BetController::class, 'index']);
    Route::post('/bets', [App\Http\Controllers\API\BetController::class, 'store']);
    Route::get('/bets/{bet}', [App\Http\Controllers\API\BetController::class, 'show']);
    Route::put('/bets/{bet}', [App\Http\Controllers\API\BetController::class, 'update']);
    Route::delete('/bets/{bet}', [App\Http\Controllers\API\BetController::class, 'destroy']);
    
    // Bet actions
    Route::post('/bets/{bet}/accept', [App\Http\Controllers\API\BetController::class, 'accept']);
    Route::post('/bets/{bet}/decline', [App\Http\Controllers\API\BetController::class, 'decline']);
    Route::post('/bets/{bet}/cancel', [App\Http\Controllers\API\BetController::class, 'cancel']);
    Route::post('/bets/{bet}/settle', [App\Http\Controllers\API\BetController::class, 'settle']);
    Route::post('/bets/{bet}/dispute', [App\Http\Controllers\API\BetController::class, 'dispute']);
});