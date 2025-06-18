@extends('welcome')

@section('title', 'Hourly Sales Hypercare')

@section('content')
    <section class="p-6 max-w-full mx-auto main-content">
        <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-900 dark:border-gray-700 mb-8 ">
            <h1 class="text-lg text-center font-bold mb-6">📊 Hourly Sales Hypercare</h1>

            <div id="chartLoading" class="text-center my-8">
                <div class="loader"></div>
            </div>

            <div id="lineChartWrapper" class="hidden">
                <div class="text-center mb-5">
                    <label for="channelSelect" class="font-medium mr-2">Select Sales Channel:</label>
                    <select id="channelSelect"
                        class="border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring focus:ring-blue-300">
                        <option value="combo">Website - Edisons & Mytopia</option>
                        <option value="eBay">eBay</option>
                        <option value="BigW">BigW</option>
                        <option value="Kogan">Kogan</option>
                        <option value="Bunnings">Bunnings</option>
                    </select>

                    <div class="mx-auto border border-gray-300 dark:border-gray-700 rounded-lg p-4 mt-5 bg-gray-50 dark:bg-gray-800"
                        style="height: 400px; max-width: 1200px;">
                        <canvas id="pastLineChart" class="w-full h-full"></canvas>
                    </div>
                </div>
            </div>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-900 dark:border-gray-700 mb-8 ">



            <div class="mt-8">
                <label for="pastDate" class="font-medium text-gray-700 dark:text-gray-200 mr-2">Filter Date:</label>
                <input type="date" id="pastDate"
                    max="{{ \Carbon\Carbon::yesterday('Australia/Sydney')->format('Y-m-d') }}"
                    class="border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:ring focus:ring-blue-300" />
            </div>

            <div id="load-past" class="hidden text-center my-4">
                <div class="spinner inline-block align-middle mr-2"></div>
                <span class="align-middle text-gray-700 dark:text-gray-200">Loading...</span>
            </div>

            <div id="past-sales" class="overflow-auto mt-4"></div>
        </div>
    </section>
@endsection
