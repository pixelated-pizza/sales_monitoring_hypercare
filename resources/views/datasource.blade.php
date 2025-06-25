@extends('welcome')

@section('title', 'Data Source')

@php
    $today = \Carbon\Carbon::today('Australia/Sydney')->format('Y-m-d');
@endphp

@section('content')
    <section class="p-6 max-w-full mx-auto main-content">
        <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-900 dark:border-gray-700 mb-8">
            <h2 class="text-center font-semibold text-lg mb-5">Data Source - Orders</h2>
            <div class="flex flex-wrap gap-4 mb-4 border border-gray-400 rounded-lg p-3">
                <label for="dateFilter" class="text-gray-800 dark:text-gray-200"><span class="font-semibold">Date:</span> 
                    <input type="date" id="dateFilter" max="{{ $today }}" value="{{ $today }}"
                    class="ml-2 border rounded p-1 dark:bg-gray-800 dark:text-gray-100" />
                </label>
                
                <label class="text-gray-800 dark:text-gray-200">
                    <span class="font-semibold">Time Range:</span> 
                    <select id="timeFilter" class="ml-2 border rounded p-1 dark:bg-gray-800 dark:text-gray-100">
                        <option value="">All</option>
                        <option value="1AM - 8AM">1AM - 8AM</option>
                        <option value="9AM - 10AM">9AM - 10AM</option>
                        <option value="11AM - 2PM">11AM - 2PM</option>
                        <option value="3PM - 5PM">3PM - 5PM</option>
                        <option value="6PM - 9PM">6PM - 9PM</option>
                        <option value="10PM - 12AM">10PM - 12AM</option>
                    </select>
                </label>

                <label class="text-gray-800 dark:text-gray-200">
                    <span class="font-semibold">Sales Channel:</span> 
                    <select id="channelFilter" class="ml-2 border rounded p-1 dark:bg-gray-800 dark:text-gray-100">
                        <option value="">All</option>
                        <option value="Edisons">Edisons</option>
                        <option value="Mytopia">Mytopia</option>
                        <option value="eBay">eBay</option>
                        <option value="BigW">BigW</option>
                        <option value="Kogan">Kogan</option>
                        <option value="Bunnings">Bunnings</option>
                    </select>
                </label>
                <label class="text-gray-800 dark:text-gray-200">
                    <span class="font-semibold">Order Status:</span> 
                    <select id="statusFilter" class="ml-2 border rounded p-1 dark:bg-gray-800 dark:text-gray-100">
                        <option value="">All</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Pack">Pack</option>
                        <option value="Pick">Pick</option>
                        <option value="On Hold">On Hold</option>
                        <option value="New Backorder">New Backorder</option>
                        <option value="Backorder Approved">Backorder Approved</option>
                    </select>
                </label>
            </div>

            <div id="load-data" class="hidden text-center my-4">
                <div class="spinner inline-block align-middle mr-2"></div>
                <span class="align-middle text-gray-700 dark:text-gray-200">Loading data source...</span>
            </div>
            <div id="order-count" class="mb-4 text-sm text-gray-700 dark:text-gray-200 font-semibold"></div>
            <div id="data-source" class="overflow-auto mt-4 overflow-auto mt-4 min-h-[300px]"></div>
            <div id="pagination" class="flex gap-2 mt-4 justify-center text-sm text-gray-700 dark:text-gray-300"></div>

        </div>
    </section>
@endsection
