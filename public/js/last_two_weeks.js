let selectedPastDate = null;
function renderPast(selectedDate = null) {
    const container = document.getElementById('past-sales');
    const loadingElem = document.getElementById('load-past');

    loadingElem.style.display = 'block';
    container.innerHTML = '';

    const params = selectedDate ? { date: selectedDate } : {};
    Promise.all([
        axios.get('/api/yesterday-sales', { params }),
        axios.get('/api/last-week', { params })
    ]).then(([todayRes, prevRes]) => {
        loadingElem.style.display = 'none';
        const todayData = todayRes.data;
        const prevData = prevRes.data;

        const timeRanges = [
            '1AM - 8AM',
            '9AM - 10AM',
            '11AM - 2PM',
            '3PM - 5PM',
            '6PM - 9PM',
            '10PM - 12AM',
        ];

        const preferredOrder = ["Edisons", "Mytopia", "eBay", "BigW", "Mydeals", "Kogan", "Bunnings"];

        const now = new Date();
        const targetDate = selectedDate ? new Date(selectedDate) : new Date(now.setDate(now.getDate() - 1));
        const lastWeekOfSelectedDate = new Date(targetDate);
        lastWeekOfSelectedDate.setDate(targetDate.getDate() - 7);

        const formatDate = (d) => d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

        const getPercentDiff = (sales, benchmark) => {
            if (benchmark === 0) return sales === 0 ? '0.00%' : '—';
            let diff = ((sales - benchmark) / benchmark) * 100;
            diff = Math.max(Math.min(diff, 999.99), -999.99);
            return diff.toFixed(2) + '%';
        };

        let html = `<div class="mb-2 font-semibold text-gray-700"><i><b>Note: </b> Benchmark values refer to the same weekday from the previous week (${formatDate(lastWeekOfSelectedDate)})</i></div>`;
        html += `<table class="min-w-full border border-gray-300 text-sm text-left text-gray-700">
        <thead class="bg-gray-100">
            <tr><th class="border px-2 py-1">Sales Channel</th>`;
        timeRanges.forEach(range => {
            html += `<th class="border px-2 py-1 bg-cyan-100" style="background-color: #00FFFF;">${range}</th><th class="border px-2 py-1">% Diff</th>`;
        });
        html += `<th class="border px-2 py-1">TOTAL</th><th class="border px-2 py-1">Total Sales below 30% of the benchmark</th></tr></thead><tbody>`;

        // WEBSITE block first
        const comboChannels = ["Edisons", "Mytopia"];
        let comboTodayTotal = 0, comboPrevTotal = 0;
        const comboToday = {}, comboPrev = {};
        let comboAlert = false;

        html += `<tr class="bg-gray-200 group cursor-pointer toggle-website collapsed">
            <td class="border px-2 py-1 font-bold">
                <span class="inline-block mr-1 transition-transform group-[.collapsed]:-rotate-90">▸</span> Website
            </td>`;
        timeRanges.forEach(range => {
            const today = (todayData["Edisons"]?.[range] || 0) + (todayData["Mytopia"]?.[range] || 0);
            const prev = (prevData["Edisons"]?.[range] || 0) + (prevData["Mytopia"]?.[range] || 0);
            const diff = getPercentDiff(today, prev);
            const isBelow50 = prev > 0 && today < prev * 0.5;
            const colorClass = isBelow50 ? 'text-red-700 font-extrabold' : 'text-green-700 font-semibold';

            html += `<td class="border px-2 py-1 text-left font-semibold">${today}</td>`;
            html += `<td class="border px-2 py-1 text-left font-semibold ${colorClass}">${diff}</td>`;
            comboToday[range] = today;
            comboPrev[range] = prev;
            comboTodayTotal += today;
            comboPrevTotal += prev;
            if (isBelow50) comboAlert = true;
        });
        const comboStatus = comboAlert ? '🚩 below 30%' : (comboTodayTotal < comboPrevTotal * 0.3 ? '🚩 below 30%' : 'within 30% of the benchmark');
        html += `<td class="border px-2 py-1 font-bold">${comboTodayTotal}</td><td class="border px-2 py-1 font-semibold">${comboStatus}</td></tr>`;

        html += `<tbody class="website-details">`;
        comboChannels.forEach(channel => {
            let row = `<tr class="even:bg-gray-50"><td class="border px-2 py-1 font-semibold pl-6">↳ ${channel}</td>`;
            timeRanges.forEach(range => {
                const today = todayData[channel]?.[range] || 0;
                const prev = prevData[channel]?.[range] || 0;
                row += `<td class="border px-2 py-1 text-left">${today}</td><td class="border px-2 py-1 text-left">—</td>`;
            });
            row += `<td class="border px-2 py-1 font-bold">—</td><td class="border px-2 py-1">—</td></tr>`;
            html += row;
        });
        html += `</tbody>`;

        html += `<tr><td class="border px-2 py-1 text-black italic">Benchmark</td>`;
        timeRanges.forEach(range => html += `<td class="border px-2 py-1 text-left" colspan="2">${comboPrev[range] || 0}</td>`);
        html += `<td class="border px-2 py-1 text-left" colspan="2">${comboPrevTotal}</td></tr>`;

        html += `<tr><td class="border px-2 py-1 text-black italic">Alert below 50% of Benchmark</td>`;
        timeRanges.forEach(range => {
            const isBelow50 = (comboPrev[range] || 0) * 0.5 > (comboToday[range] || 0);
            html += `<td class="border px-2 py-1 text-center font-bold" colspan="2">${isBelow50 ? '🚩' : ''}</td>`;
        });
        html += `<td class="border px-2 py-1 bg-gray-800" colspan="2"></td></tr>`;

        html += `<tr><td class="border px-2 py-1 text-black italic">50% of Benchmark</td>`;
        timeRanges.forEach(range => html += `<td class="border px-2 py-1 text-left" colspan="2">${((comboPrev[range] || 0) / 2).toFixed(0)}</td>`);
        html += `<td class="border px-2 py-1 text-left" colspan="2">${(comboPrevTotal / 2).toFixed(0)}</td></tr>`;

        // Other channels
        preferredOrder.forEach(channel => {
            if (comboChannels.includes(channel)) return;
            if (!todayData[channel] && !prevData[channel]) return;

            let totalToday = 0, totalPrev = 0, alert = false;
            let row = `<tr class="bg-gray-200"><td class="border px-2 py-1 font-semibold">${channel}</td>`;
            timeRanges.forEach(range => {
                const today = todayData[channel]?.[range] || 0;
                const prev = prevData[channel]?.[range] || 0;
                const diff = getPercentDiff(today, prev);
                const isBelow50 = prev > 0 && today < prev * 0.5;
                const colorClass = isBelow50 ? 'text-red-700 font-extrabold' : 'text-green-700 font-semibold';
                row += `<td class="border px-2 py-1 text-left">${today}</td><td class="border px-2 py-1 text-left ${colorClass}">${diff}</td>`;
                totalToday += today;
                totalPrev += prev;
                if (isBelow50) alert = true;
            });
            const status = alert ? '🚩 below 30%' : (totalToday < totalPrev * 0.3 ? '🚩 below 30%' : 'within 30% of the benchmark');
            row += `<td class="border px-2 py-1 font-bold">${totalToday}</td><td class="border px-2 py-1 font-semibold">${status}</td></tr>`;
            html += row;

            html += `<tr><td class="border px-2 py-1 text-black italic">Benchmark</td>`;
            timeRanges.forEach(range => html += `<td class="border px-2 py-1 text-left" colspan="2">${prevData[channel]?.[range] || 0}</td>`);
            html += `<td class="border px-2 py-1 text-left" colspan="2">${totalPrev}</td></tr>`;

            html += `<tr><td class="border px-2 py-1 text-black italic">Alert below 50% of Benchmark</td>`;
            timeRanges.forEach(range => {
                const isBelow50 = (prevData[channel]?.[range] || 0) * 0.5 > (todayData[channel]?.[range] || 0);
                html += `<td class="border px-2 py-1 text-center font-bold" colspan="2">${isBelow50 ? '🚩' : ''}</td>`;
            });
            html += `<td class="border px-2 py-1 bg-gray-800" colspan="2"></td></tr>`;

            html += `<tr><td class="border px-2 py-1 text-black italic">50% of Benchmark</td>`;
            timeRanges.forEach(range => html += `<td class="border px-2 py-1 text-left font-semibold" colspan="2">${((prevData[channel]?.[range] || 0) / 2).toFixed(0)}</td>`);
            html += `<td class="border px-2 py-1 text-left" colspan="2">${(totalPrev / 2).toFixed(0)}</td></tr>`;
        });

        html += `</tbody></table>`;

        // Chart
        function renderLineChart(channelKey = 'combo') {
            const ctx = document.getElementById('pastLineChart').getContext('2d');
            if (window.pastChartInstance) window.pastChartInstance.destroy();

            const getSalesData = (source, channel) =>
                channel === 'combo'
                    ? timeRanges.map(r => (source["Edisons"]?.[r] || 0) + (source["Mytopia"]?.[r] || 0))
                    : timeRanges.map(r => source[channel]?.[r] || 0);

            const salesToday = getSalesData(todayData, channelKey);
            const salesPrev = getSalesData(prevData, channelKey);

            window.pastChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: timeRanges,
                    datasets: [
                        {
                            label: formatDate(targetDate),
                            data: salesToday,
                            borderColor: 'rgba(54, 162, 235, 1)',
                            backgroundColor: 'rgba(54, 162, 235, 0.1)',
                            tension: 0.4,
                            fill: false
                        },
                        {
                            label: formatDate(lastWeekOfSelectedDate),
                            data: salesPrev,
                            borderColor: 'rgba(255, 99, 132, 1)',
                            backgroundColor: 'rgba(255, 99, 132, 0.1)',
                            tension: 0.4,
                            fill: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: `Sales Comparison`,
                            font: { size: 18 },
                            padding: {
                                bottom: 10
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: ctx => `${ctx.dataset.label}: ${ctx.raw}`
                            }
                        },
                        legend: { position: 'bottom' }
                    },
                    scales: {
                        y: { title: { display: true, text: 'Number of Sales' }, beginAtZero: true },
                        x: { title: { display: true, text: 'Time Range' } }
                    }
                }
            });

            document.getElementById('chartLoading').style.display = 'none';
            document.getElementById('lineChartWrapper').style.display = 'block';
        }

        document.getElementById('channelSelect').addEventListener('change', function () {
            renderLineChart(this.value);
        });

        renderLineChart('combo');

        
        container.innerHTML = html;

        document.addEventListener('click', function (e) {
            const row = e.target.closest('.toggle-website');
            if (!row) return;
            row.classList.toggle('collapsed');
            const details = document.querySelectorAll('.website-details');
            details.forEach(d => d.style.display = row.classList.contains('collapsed') ? 'none' : 'table-row-group');
        });
    }).catch(err => {
        loadingElem.style.display = 'none';
        container.innerHTML = `<div class="text-red-600">Failed to load summary report.</div>`;
        console.error('Failed to load summary report:', err);
    });
}

document.getElementById('pastDate').addEventListener('change', function () {
    selectedPastDate = this.value;
    renderPast(selectedPastDate);
});

document.addEventListener('DOMContentLoaded', function () {
    const sydneyNowStr = new Date().toLocaleString('en-US', { timeZone: 'Australia/Sydney' });
    const sydneyDate = new Date(sydneyNowStr);
    sydneyDate.setDate(sydneyDate.getDate() - 1);
    selectedPastDate = sydneyDate.toISOString().split('T')[0];
    document.getElementById('pastDate').value = selectedPastDate;
    renderPast(selectedPastDate);
});
