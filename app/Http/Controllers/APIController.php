<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\DataService;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class APIController extends Controller
{
    public function hypercare() {
        
    }

    public function monitoring() {

    }

    public function forecast(OrderService $result) {
        try {
            $days = 7;
            $data = $result->predict_sales($days);
            return $data;
        } catch (\Exception $e) {
            Log::error('Data source error: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve data.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function data_source(Request $request, DataService $result)
    {
        try {
            $data = $result->getRawOrders($request);
            return $data;
        } catch (\Exception $e) {
            Log::error('Data source error: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve data.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
