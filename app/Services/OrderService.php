<?php

namespace App\Services;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use GuzzleHttp\Client;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;


class OrderService
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

    public function fetchAndGroupSales($date)
    {
        $cacheKey = 'sales_' . $date->toDateString();
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
                    'NETOAPI_USERNAME' => env('NETO_API_USERNAME'),
                    'NETOAPI_KEY' => env('NETO_API_KEY')
                    
                ],
                'json' => [
                    "Filter" => [
                        "DatePlacedFrom" => [$dateFrom],
                        "DatePlacedTo" => [$dateTo],
                        "SalesChannel" => ["Edisons", "Mytopia", "eBay", "BigW", "Mydeals", "Kogan", "Bunnings"],
                        "OutputSelector" => ["OrderID", "SalesChannel", "DatePlaced", "OrderLine"]
                    ]
                ]
            ]);

            $orders = json_decode($response->getBody(), true)['Order'] ?? [];
            $grouped = [];

            foreach ($orders as $order) {
                if (!isset($order['SalesChannel'], $order['DatePlaced'], $order['OrderLine'])) continue;

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
        });
    }

    public function fetchTodaySales()
    {
        $date = Carbon::today('Australia/Sydney');
        return $this->fetchAndGroupSales($date);
    }

    public function fetchSameWeekdayLastWeekSales()
    {
        $date = Carbon::today('Australia/Sydney')->subDays(7);
        return $this->fetchAndGroupSales($date);
    }

    public function predict_sales(int $days)
    {
        $now = Carbon::now('Australia/Sydney');
        $currentHour = $now->hour;
        $timeBuckets = [
            '1AM - 8AM'   => range(1, 8),
            '9AM - 10AM'  => range(9, 10),
            '11AM - 2PM'  => range(11, 14),
            '3PM - 5PM'   => range(15, 17),
            '6PM - 9PM'   => range(18, 21),
            '10PM - 12AM' => [22, 23, 0],
        ];

        $cacheKey = 'sales_prediction_today_' . $now->format('Y-m-d_H');
        return Cache::remember($cacheKey, now()->addMinutes(30), function () use ($days, $now, $timeBuckets, $currentHour) {

            $history = [];
            for ($i = $days; $i > 0; $i--) {
                $date = Carbon::today('Australia/Sydney')->subDays($i);
                $dailySales = $this->fetchAndGroupSales($date);

                foreach ($dailySales as $channel => $timeData) {
                    foreach ($timeData as $timeLabel => $count) {
                        $history[$channel][$timeLabel][] = $count;
                    }
                }
            }

            $todaySales = $this->fetchAndGroupSales(Carbon::today('Australia/Sydney'));

            $results = [];

            $allChannels = array_unique(array_merge(array_keys($history), array_keys($todaySales)));

            foreach ($allChannels as $channel) {
                foreach ($timeBuckets as $bucket => $hours) {
                    $latestHour = max($hours);
                    $isFuture = ($latestHour > $currentHour || ($latestHour === 0 && $currentHour < 1));

                    if ($isFuture) {
                        $counts = $history[$channel][$bucket] ?? [];
                        $n = count($counts);
                        if ($n >= 2) {
                            $x = range(1, $n);
                            $y = $counts;

                            $x_mean = array_sum($x) / $n;
                            $y_mean = array_sum($y) / $n;

                            $numerator = 0;
                            $denominator = 0;
                            for ($i = 0; $i < $n; $i++) {
                                $numerator += ($x[$i] - $x_mean) * ($y[$i] - $y_mean);
                                $denominator += pow($x[$i] - $x_mean, 2);
                            }

                            $slope = $denominator != 0 ? $numerator / $denominator : 0;
                            $intercept = $y_mean - $slope * $x_mean;
                            $predictedCount = $slope * ($n + 1) + $intercept;

                            $results[$channel][$bucket] = round(max(0, $predictedCount));
                        } else {
                            $results[$channel][$bucket] = 0;
                        }
                    } else {
                        $results[$channel][$bucket] = $todaySales[$channel][$bucket] ?? 0;
                    }
                }
            }

            return $results;
        });
    }
}
