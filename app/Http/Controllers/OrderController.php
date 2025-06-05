<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use GuzzleHttp\Client;
use Carbon\Carbon;

class OrderController extends Controller
{


    public function fetchAndGroupSales() {
    $client = new Client();
    $lastWeekSameDay = Carbon::today('Australia/Sydney')->subWeek(); 

    $dateFrom = $lastWeekSameDay->copy()->format('Y-m-d') . ' 00:00:00';
    $dateTo   = $lastWeekSameDay->copy()->format('Y-m-d') . ' 23:59:59';

    // dd($dateTo);

    $response = $client->request('POST', env('NETO_API_URL'), [
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

    $result = json_decode($response->getBody(), true);
    $orders = $result['Order'] ?? [];

    $timeBuckets = [
    '12AM - 8AM'   => [0, 7],
    '9AM - 10AM'   => [9, 10],
    '11AM - 2PM'   => [11, 14],
    '3PM - 5PM'    => [15, 17],
    '6PM - 9PM'    => [18, 21],
    '10PM - 11PM'  => [22, 23],
];

    $grouped = [];

    foreach ($orders as $order) {
        if (!isset($order['SalesChannel'], $order['DatePlaced'])) {
            continue;
        }

        $datePlaced = Carbon::parse($order['DatePlaced'])->addHours(10);
        $hour = (int) $datePlaced->format('H');

        $matchedBucket = null;
        foreach ($timeBuckets as $label => [$start, $end]) {
            if ($hour >= $start && $hour <= $end) {
                $matchedBucket = $label;
                break;
            }
        }

        if ($matchedBucket) {
            $channel = $order['SalesChannel'];
            $grouped[$channel][$matchedBucket] = ($grouped[$channel][$matchedBucket] ?? 0) + 1;
        }
    }

    return $grouped;
}

public function fetchAndGroupTodaySales()
{
    $client = new Client();
    $today = Carbon::today('Australia/Sydney')->format('Y-m-d'); 

    $response = $client->request('POST', env('NETO_API_URL'), [
        'headers' => [
            'Accept' => 'application/json',
            'NETOAPI_ACTION' => 'GetOrder',
            'NETOAPI_KEY' => env('NETO_API_KEY')
        ],
        'json' => [
            "Filter" => [
                "DatePlacedFrom" => ["{$today} 00:00:00"],
                "DatePlacedTo" => ["{$today} 23:59:59"],
                "SalesChannel" => ["Edisons", "Mytopia", "eBay", "BigW", "Mydeals", "Kogan", "Bunnings"],
                "OutputSelector" => ["OrderID", "SalesChannel", "DatePlaced"]
            ]
        ]
    ]);

    $result = json_decode($response->getBody(), true);
    $orders = $result['Order'] ?? [];

    $timeBuckets = [
        '12AM - 8AM'   => [0, 7],
        '9AM - 10AM'   => [9, 10],
        '11AM - 2PM'   => [11, 14],
        '3PM - 5PM'    => [15, 17],
        '6PM - 9PM'    => [18, 21],
        '10PM - 11PM'  => [22, 23],
    ];

    $grouped = [];

    foreach ($orders as $order) {
        if (!isset($order['SalesChannel'], $order['DatePlaced'])) {
            continue;
        }

        $datePlaced = Carbon::parse($order['DatePlaced'])->addHours(10);
        $hour = (int) $datePlaced->format('H');

        $matchedBucket = null;
        foreach ($timeBuckets as $label => [$start, $end]) {
            if ($hour >= $start && $hour <= $end) {
                $matchedBucket = $label;
                break;
            }
        }

        if ($matchedBucket) {
            $channel = $order['SalesChannel'];
            $grouped[$channel][$matchedBucket] = ($grouped[$channel][$matchedBucket] ?? 0) + 1;
        }
    }

    return $grouped;
}


}
