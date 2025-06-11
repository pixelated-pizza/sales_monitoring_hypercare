@extends('welcome')

@section('title', 'Hourly Sales Monitoring')

@section('content')
    <section class="p-6 max-w-full mx-auto">
        
        <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mb-8">
            <span class="text-lg font-semibold mb-4 text-gray-900 text-center mb-5">📊 Real-time Monitoring</span>

            <div id="loading" style="display:none; text-align:center; margin:10px 0;">
                <div class="spinner" style="display:inline-block; vertical-align:middle; margin-right: 8px;"></div>
                <span style="vertical-align:middle;">Loading data...</span>
            </div>
            <div id="summary-report" class="overflow-auto"></div>

            
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
