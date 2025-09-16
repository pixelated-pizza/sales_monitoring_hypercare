<?php

namespace App\Services;

use Illuminate\Http\Request;
use Carbon\Carbon;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class DataService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    protected $timeBuckets = [
        '1AM - 8AM'   => [1, 8],
        '9AM - 10AM'  => [9, 10],
        '11AM - 2PM'  => [11, 14],
        '3PM - 5PM'   => [15, 17],
        '6PM - 9PM'   => [18, 21],
        '10PM - 12AM' => [22, 23, 0],
    ];


    private function fetchSalesByDate($date)
    {
        $cacheKey = 'sales_' . $date->toDateString() . '_raw';
        $timeBuckets = $this->timeBuckets;

        return Cache::remember($cacheKey, now()->addMinutes(10), function () use ($date, $timeBuckets) {
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
                        "OutputSelector" => ["OrderID", "SalesChannel", "DatePlaced"]
                    ]
                ]
            ]);

            $orders = json_decode($response->getBody(), true)['Order'] ?? [];
            $grouped = [];

            foreach ($orders as $order) {
                if (!isset($order['SalesChannel'], $order['DatePlaced'])) continue;


                $datePlaced = Carbon::parse($order['DatePlaced'], 'UTC')->setTimezone('Australia/Sydney');
                $hour = (int) $datePlaced->format('H');

                foreach ($timeBuckets as $label => [$start, $end]) {
                    if ($hour >= $start && $hour <= $end) {
                        $channel = $order['SalesChannel'];
                        $grouped[$channel][$label] = ($grouped[$channel][$label] ?? 0) + 1;
                        break;
                    }
                }
            }

            return $grouped;
        });
    }

    public function fetchYesterdaySales(Request $request)
    {
        $dateStr = $request->query('date');
        $date = $dateStr
            ? Carbon::parse($dateStr, 'Australia/Sydney')
            : Carbon::today('Australia/Sydney')->subDay();

        return $this->fetchSalesByDate($date);
    }

    public function fetchSameWeekdayLastWeekSales(Request $request)
    {
        $dateStr = $request->query('date');
        $date = $dateStr
            ? Carbon::parse($dateStr, 'Australia/Sydney')->subDays(7)
            : Carbon::today('Australia/Sydney')->subDays(8);

        return $this->fetchSalesByDate($date);
    }


    //Data source

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
                        'NETOAPI_USERNAME' => env('NETO_API_USERNAME'),
                        'NETOAPI_KEY' => env('NETO_API_KEY')
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
                Log::error('Neto API fetchData failed: ' . $e->getMessage());
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
