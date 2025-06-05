<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OrderController;

Route::get('/', function () {
    return view('orders');
});

Route::get('/api/prev-sales', [OrderController::class, 'fetchAndGroupSales']);

Route::get('/api/today-sales', [OrderController::class, 'fetchAndGroupTodaySales']);
