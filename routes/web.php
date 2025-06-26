<?php

use App\Http\Controllers\DataSourceController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PastDataController;

Route::get('/', function () {
    return view('orders');  
})->name('sales');

Route::get('/hypercare', function () {
    return view('hypercare');  
})->name('hypercare');

Route::get('/datasource', function () {
    return view('datasource');  
})->name('datasource');

Route::get('/api/prev-sales', [OrderController::class, 'fetchSameWeekdayLastWeekSales']);

Route::get('/api/today-sales', [OrderController::class, 'fetchTodaySales']);

Route::get('/api/two-weeks', [PastDataController::class, 'groupOrdersByTimeBucket']);

Route::get('/api/yesterday-sales', [PastDataController::class, 'fetchYesterdaySales']);
Route::get('/api/last-week', [PastDataController::class, 'fetchSameWeekdayLastWeekSales']);

Route::get('/api/data-source', [DataSourceController::class, 'getRawOrders']);
Route::get('/api/predict-sales', [OrderController::class, 'predict_sales']);