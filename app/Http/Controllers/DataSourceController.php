<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Carbon\Carbon;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Cache;

class DataSourceController extends Controller
{
    
    public function fetchData($date)
    {
        $cacheKey = 'data_' . $date->toDateString() . '_raw';

        return Cache::remember($cacheKey, now()->addMinutes(5), function () use ($date) {
            $client = new Client();

            $dateFrom = $date->copy()
                ->setTimezone('Australia/Sydney')
                ->setTime(1, 0, 0)
                ->timezone('UTC')
                ->format('Y-m-d H:i:s');

            $dateTo = $date->copy()
                ->addDay()
                ->setTimezone('Australia/Sydney')
                ->setTime(0, 59, 59)
                ->timezone('UTC')
                ->format('Y-m-d H:i:s');

            try {
                $response = $client->post(env('NETO_API_URL'), [
                    'headers' => [
                        'Accept' => 'application/json',
                        'NETOAPI_ACTION' => 'GetOrder',
                        'NETOAPI_KEY' => env('NETO_API_KEY'),
                        'NETOAPI_USERNAME' => env('NETO_API_USERNAME'),
                    ],
                    'json' => [
                        "Filter" => [
                            "DatePlacedFrom" => [$dateFrom],
                            "DatePlacedTo" => [$dateTo],
                            "SalesChannel" => ["Edisons", "Mytopia", "eBay", "BigW", "Mydeals", "Kogan", "Bunnings"],
                            "OutputSelector" => [
                                "OrderID",
                                "OrderStatus",
                                "SalesChannel",
                                "DatePlaced",
                                "OrderLine",
                            ]
                        ]
                    ]
                ]);

                $body = json_decode($response->getBody(), true);

                if (isset($body['Order'])) {
                    return $body['Order'];
                }

                return [];
            } catch (\Exception $e) {
                \Log::error('Neto API fetchData failed: ' . $e->getMessage());
                return [];
            }
        });
    }

    public function getRawOrders(Request $request)
    {
        $dateStr = $request->query('date');
        $date = $dateStr
            ? Carbon::parse($dateStr, 'Australia/Sydney')
            : Carbon::today('Australia/Sydney');

        $raw = $this->fetchData($date);

        $flattened = [];

        foreach ($raw ?? [] as $order) {
            foreach ($order['OrderLine'] ?? [] as $line) {
                $flattened[] = [
                    'OrderID' => $line['OrderLineID'] ?? '',
                    'OrderStatus' => $order['OrderStatus'] ?? '',
                    'SalesChannel' => $order['SalesChannel'] ?? '',
                    'DatePlaced' => $order['DatePlaced'] ?? '',
                    'OrderLineSKU' => $line['SKU'] ?? '',
                    'OrderLineQty' => $line['Quantity'] ?? '',
                ];
            }
        }

        return response()->json($flattened);
    }
}
