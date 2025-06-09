@extends('welcome')

@section('title', 'Hourly Sales Hypercare')

@section('content')

@section('content')
    <section class="p-6 max-w-full mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-6 text-center dark:text-gray-100">📊 Hourly Sales Hypercare</h1>


        <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mb-8">


            <div class="mb-4">
                <label for="pastDate" class="font-semibold text-gray-700 mr-2">Date Filter:</label>
                <input type="date" id="pastDate" max="{{ \Carbon\Carbon::yesterday('Australia/Sydney')->format('Y-m-d') }}"
                    class="border px-2 py-1 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700" />
            </div>

            <div id="load-past" style="display:none; text-align:center; margin:10px 0;">
                <div class="spinner" style="display:inline-block; vertical-align:middle; margin-right: 8px;"></div>
                <span style="vertical-align:middle;">Loading data...</span>
            </div>
            <div id="past-sales" class="overflow-auto"></div>
        </div>

        {{-- <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-700 mb-4">📅 Previous Sales Data</h3>
            <div id="sales-data" class="overflow-auto"></div>
        </div>

        <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-700 mb-4">📆 Today's Sales Data</h3>
            <div id="today-sales-data" class="overflow-auto"></div>
        </div>
    </div> --}}
    </section>
@endsection
