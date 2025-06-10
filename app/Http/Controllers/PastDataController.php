<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Cache;

class PastDataController extends Controller
{
    protected $timeBuckets = [
        '12AM - 8AM'   => [0, 7],
        '9AM - 10AM'   => [9, 10],
        '11AM - 2PM'   => [11, 14],
        '3PM - 5PM'    => [15, 17],
        '6PM - 9PM'    => [18, 21],
        '10PM - 11PM'  => [22, 23],
    ];

    private function fetchSalesByDate($date)
{
    $cacheKey = 'sales_' . $date->toDateString();

    return Cache::remember($cacheKey, now()->addMinutes(10), function () use ($date) {
        $client = new \GuzzleHttp\Client();
        $dateStr = $date->format('Y-m-d');
        $dateFrom = "{$dateStr} 00:00:00";
        $dateTo = "{$dateStr} 23:59:59";

        $response = $client->post(env('NETO_API_URL'), [
            'headers' => [
                'Accept' => 'application/json',
                'NETOAPI_ACTION' => 'GetOrder',
                'NETOAPI_KEY' => env('NETO_API_KEY')
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
            if (empty($order['SalesChannel']) || empty($order['DatePlaced'])) continue;

            $hour = \Carbon\Carbon::parse($order['DatePlaced'])->addHours(10)->hour;

            foreach ($this->timeBuckets as $label => [$start, $end]) {
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
}
