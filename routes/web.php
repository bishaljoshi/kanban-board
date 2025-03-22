<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BoardController;

Route::get('/', [BoardController::class, 'dashboard']);
Route::get('/tasks', [BoardController::class, 'index']);
Route::post('/tasks', [BoardController::class, 'store']);
Route::delete('/tasks/{id}', [BoardController::class, 'destroy']);
Route::put('/tasks/{id}', [BoardController::class, 'update']);
Route::post('/tasks/reorder', [BoardController::class, 'reorder']);