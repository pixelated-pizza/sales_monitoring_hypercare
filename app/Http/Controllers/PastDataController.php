<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;
use GuzzleHttp\Client;

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

    private function fetchSalesByDate($date) {
    $client = new Client();
    $dateFrom = $date->copy()->format('Y-m-d') . ' 00:00:00';
    $dateTo = $date->copy()->format('Y-m-d') . ' 23:59:59';

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
        if (!isset($order['SalesChannel'], $order['DatePlaced'])) continue;

        $datePlaced = Carbon::parse($order['DatePlaced'])->addHours(10);
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
}


    public function fetchYesterdaySales(Request $request) {
        $dateStr = $request->query('date');
        $date = $dateStr ? Carbon::parse($dateStr, 'Australia/Sydney') : Carbon::today('Australia/Sydney')->subDay();
        return $this->fetchSalesByDate($date);
    }

    public function fetchSameWeekdayLastWeekSales(Request $request) {
        $dateStr = $request->query('date');

        if ($dateStr) {
            $date = Carbon::parse($dateStr, 'Australia/Sydney')->subDays(7);
        } else {
            $date = Carbon::today('Australia/Sydney')->subDays(8);
        }

        return $this->fetchSalesByDate($date);
    }



}
