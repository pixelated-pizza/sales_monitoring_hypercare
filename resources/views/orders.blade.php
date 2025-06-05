@extends('welcome')

@section('title', 'Hourly Sales Monitoring & Hypercare')

@section('content')

    <section class="p-6 max-w-full mx-auto">
        <h1 class="text-2xl font-bold text-gray-800 mb-6 text-center">📊 Hourly Sales Monitoring</h1>

        <div class="flex flex-wrap gap-4 justify-center">
            <div id="sales-data" class="overflow-auto bg-white shadow-md rounded-lg border border-gray-200"></div>

            <div id="today-sales-data" class="overflow-auto bg-white shadow-md rounded-lg border border-gray-200"></div>
        </div>


        <div id="summary-report" class="mt-5"></div>


    </section>

@endsection
