@extends('welcome')

@section('title', 'Hourly Sales Monitoring')

@section('content')
    <section class="p-6 max-w-full mx-auto">

        <div class="bg-white rounded-2xl shadow-lg p-6 mb-2">
            <div id="predictGrapHWrapper">

                <p id="prediction-date" class="text-lg text-center font-semibold text-gray-600 mb-3"></p>
                <div class="mb-4 flex flex-wrap gap-4 ">
                    <label for="channelSelect" class="content-center text-sm font-medium text-gray-700">Select
                        Channel:</label>
                    <select id="channelSelect"
                        class="border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring focus:ring-blue-300">
                        <option value="all">All Channels</option>
                    </select>

                </div>

                <div id="load-prediction" style="display:none; text-align:center; margin:10px 0;">
                    <div class="spinner" style="display:inline-block; vertical-align:middle; margin-right: 8px;"></div>
                    <span style="vertical-align:middle;">Loading graph...</span>
                </div>
                <canvas id="predictionChart" height="100"></canvas>
            </div>

        </div>

    </section>
@endsection
