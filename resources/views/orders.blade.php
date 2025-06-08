@extends('welcome')

@section('title', 'Hourly Sales Monitoring & Hypercare')

@section('content')
<section class="p-6 max-w-full mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 mb-6 text-center">📊 Hourly Sales Monitoring & Hypercare</h1>

    <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mb-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Summary Report</h2>
        <div id="summary-report" class="max-h-[80vh] overflow-auto p-4 bg-white rounded shadow-md border border-gray-200"></div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-700 mb-4">📅 Previous Sales Data</h3>
            <div id="sales-data" class="overflow-auto"></div>
        </div>

        <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-700 mb-4">📆 Today's Sales Data</h3>
            <div id="today-sales-data" class="overflow-auto"></div>
        </div>
    </div>
</section>
@endsection
