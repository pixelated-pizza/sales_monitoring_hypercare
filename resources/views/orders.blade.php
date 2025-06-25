@extends('welcome')

@section('title', 'Hourly Sales Monitoring')

@section('content')
    <section class="p-6 max-w-full mx-auto">

        <div class="bg-white rounded-2xl shadow-lg p-6 mb-2">
            <div class="mb-4">
                <label for="channelSelect" class="block text-sm font-medium text-gray-700">Select Channel:</label>
                <select id="channelSelect" class="border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring focus:ring-blue-300">
                    <option value="all">All Channels</option>
                </select>
            </div>
            <p id="prediction-date" class="text-lg text-center font-semibold text-gray-600 mb-3"></p>

            <canvas id="predictionChart" height="50"></canvas>
        </div>


        <div class="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div class="flex items-center justify-center mb-5">
                <span class="realtime-dot mr-2"></span>
                <span id="last-updated" class="text-sm font-medium text-gray-700">Updated just now</span>
            </div>

            <div id="loading" style="display:none; text-align:center; margin:10px 0;">
                <div class="spinner" style="display:inline-block; vertical-align:middle; margin-right: 8px;"></div>
                <span style="vertical-align:middle;">Loading data...</span>
            </div>

            <div id="summary-report" class="overflow-auto"></div>
        </div>


    </section>
@endsection
