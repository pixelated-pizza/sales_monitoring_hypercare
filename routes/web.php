<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PastDataController;

Route::get('/', function () {
    return view('orders');  
})->name('sales');

Route::get('/hypercare', function () {
    return view('hypercare');  
})->name('hypercare');

Route::get('/api/prev-sales', [OrderController::class, 'fetchAndGroupSales']);

Route::get('/api/today-sales', [OrderController::class, 'fetchAndGroupTodaySales']);

Route::get('/api/two-weeks', [PastDataController::class, 'groupOrdersByTimeBucket']);

Route::get('/api/yesterday-sales', [PastDataController::class, 'fetchYesterdaySales']);
Route::get('/api/last-week', [PastDataController::class, 'fetchSameWeekdayLastWeekSales']);