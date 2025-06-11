@extends('welcome')

@section('title', 'Hourly Sales Hypercare')

@section('content')

@section('content')
    <section class="p-6 max-w-full mx-auto">
        <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mb-8 dark:bg-gray-100">
            <h1 class="text-xl font-bold text-center text-gray-900 mb-6">📊 Hourly Sales Hypercare</h1>

            <div id="chartLoading" class="text-center my-8">
                <div class="loader text-gray-600"></div>
            </div>

            <div id="lineChartWrapper" class="hidden">
                <div class="text-center mb-5">
                    <label for="channelSelect" class="font-medium text-gray-800 mr-2">Select Sales Channel:</label>
                    <select id="channelSelect"
                        class="border border-gray-300 px-3 py-1.5 rounded-md bg-white text-gray-900 focus:ring focus:ring-blue-200">
                        <option value="combo">Website - Edisons & Mytopia</option>
                        <option value="eBay">eBay</option>
                        <option value="BigW">BigW</option>
                        <option value="Mydeals">Mydeals</option>
                        <option value="Kogan">Kogan</option>
                        <option value="Bunnings">Bunnings</option>
                    </select>

                    <div class="mx-auto border border-gray-300 rounded-lg p-4 mt-5"
                        style="height: 400px; max-width: 1000px;">
                        <canvas id="pastLineChart" class="w-full h-full"></canvas>
                    </div>


                </div>

            </div>

            <div class="mt-8">
                <label for="pastDate" class="font-medium text-gray-700 mr-2">Filter Date:</label>
                <input type="date" id="pastDate"
                    max="{{ \Carbon\Carbon::yesterday('Australia/Sydney')->format('Y-m-d') }}"
                    class="border border-gray-300 px-3 py-1.5 rounded-md text-gray-900 bg-white focus:ring focus:ring-blue-200" />
            </div>

            <div id="load-past" class="hidden text-center my-4">
                <div class="spinner inline-block align-middle mr-2"></div>
                <span class="align-middle text-gray-700"></span>
            </div>

            <div id="past-sales" class="overflow-auto mt-4"></div>
        </div>

    </section>
@endsection
