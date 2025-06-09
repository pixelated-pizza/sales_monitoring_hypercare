let selectedPastDate = null;
function renderPast(selectedDate = null) {

    const container = document.getElementById('past-sales');
    const loadingElem = document.getElementById('load-past');

    loadingElem.style.display = 'block';  
    container.innerHTML = ''; 

    const params = selectedDate ? { date: selectedDate } : {};
    Promise.all([
         axios.get('/api/yesterday-sales', { params }),
         axios.get('/api/last-week')
    ]).then(([todayRes, prevRes]) => {
        loadingElem.style.display = 'none';
        const todayData = todayRes.data;
        const prevData = prevRes.data;

        const timeRanges = [
            '12AM - 8AM',
            '9AM - 10AM',
            '11AM - 2PM',
            '3PM - 5PM',
            '6PM - 9PM',
            '10PM - 11PM'
        ];

        const preferredOrder = ["Edisons", "Mytopia", "eBay", "BigW", "Mydeals", "Kogan", "Bunnings"];
        

        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const lastWeekOfYesterday = new Date(yesterday);
        lastWeekOfYesterday.setDate(lastWeekOfYesterday.getDate() - 7);

        const formatDate = (d) => {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return d.toLocaleDateString(undefined, options);
        };

        let html = `<div class="mb-2 font-semibold text-gray-700"><i><b>Note: </b> Benchmark values refers to the same weekday from the previous week (${formatDate(lastWeekOfYesterday)})</i></div>`;

        const getPercentDiff = (sales, benchmark) => {
            if (benchmark === 0) {
                if (sales === 0) return '0.00%';
                return '—';
            }
            let diff = ((sales - benchmark) / benchmark) * 100;
            if (diff > 999.99) diff = 999.99;
            if (diff < -999.99) diff = -999.99;
            return diff.toFixed(2) + '%';
        };

        let comboChannels = ["Edisons", "Mytopia"];
        let comboTodayTotal = 0;
        let comboPrevTotal = 0;
        const comboToday = {};
        const comboPrev = {};
        let comboAlert = false;

        html += `<table class="min-w-full border border-gray-300 text-sm text-left text-gray-700">
          <thead class="bg-gray-100">
            <tr><th class="border px-2 py-1">Sales Channel</th>`;

        timeRanges.forEach(range => {
            html += `<th class="border px-2 py-1 bg-cyan-100" style="background-color: #00FFFF;">${range}</th><th class="border px-2 py-1">% Diff</th>`;
        });
        html += `<th class="border px-2 py-1">TOTAL</th><th class="border px-2 py-1">Total Sales Status</th></tr></thead><tbody>`;

        comboChannels.forEach(channel => {
            let row = `<tr class="even:bg-gray-50"><td class="border px-2 py-1 font-semibold">${channel}</td>`;
            timeRanges.forEach(range => {
                const today = todayData[channel]?.[range] || 0;
                const prev = prevData[channel]?.[range] || 0;
                const isAlert = prev > 0 && today < prev * 0.5;

                if (isAlert) comboAlert = true;

                row += `<td class="border px-2 py-1 text-left">${today}</td>`;
                row += `<td class="border px-2 py-1 text-left">${getPercentDiff(today, prev)}</td>`;

                comboToday[range] = (comboToday[range] || 0) + today;
                comboPrev[range] = (comboPrev[range] || 0) + prev;
                comboTodayTotal += today;
                comboPrevTotal += prev;
            });

            row += `<td class="border px-2 py-1 font-bold">—</td><td class="border px-2 py-1">—</td></tr>`;
            html += row;
        });

        html += `<tr class="bg-gray-200"><td class="border px-2 py-1 font-bold">TOTAL (Edisons + Mytopia)</td>`;
        timeRanges.forEach(range => {
            const today = comboToday[range] || 0;
            const prev = comboPrev[range] || 0;
            const diff = getPercentDiff(today, prev);
            const rawDiff = prev === 0 ? 0 : ((today - prev) / prev) * 100;
            const isAlert = prev > 0 && today < prev * 0.5;
            const colorClass = isAlert ? 'text-red-700 font-extrabold' : (rawDiff < 0 ? 'text-red-500 font-bold' : 'text-green-500 font-bold');

            html += `<td class="border px-2 py-1 text-left">${today}</td>`;
            html += `<td class="border px-2 py-1 text-left ${colorClass}">${diff}</td>`;
        });

        const comboStatus = comboAlert ? '🚩' : (comboTodayTotal < comboPrevTotal * 0.3 ? '🚩 below 30%' : 'within 30% of the benchmark');
        html += `<td class="border px-2 py-1 font-bold">${comboTodayTotal}</td><td class="border px-2 py-1">${comboStatus}</td></tr>`;

        html += `<tr><td class="border px-2 py-1 text-gray-500 italic">Benchmark</td>`;
        timeRanges.forEach(range => {
            html += `<td class="border px-2 py-1 text-left" colspan="2">${comboPrev[range] || 0}</td>`;
        });
        html += `<td class="border px-2 py-1 text-left" colspan="2">${comboPrevTotal}</td></tr>`;

        html += `<tr><td class="border px-2 py-1 text-gray-500 italic">Alert below 50% of Benchmark</td>`;
        timeRanges.forEach(() => {
            html += `<td class="border px-2 py-1 text-center" colspan="2">—</td>`;
        });
        html += `<td class="border px-2 py-1 text-left" colspan="2">${comboStatus}</td></tr>`;

        html += `<tr><td class="border px-2 py-1 text-gray-500 italic">50% of Benchmark</td>`;
        timeRanges.forEach(range => {
            const val = comboPrev[range] || 0;
            html += `<td class="border px-2 py-1 text-left" colspan="2">${(val / 2).toFixed(0)}</td>`;
        });
        html += `<td class="border px-2 py-1 text-left" colspan="2">${(comboPrevTotal / 2).toFixed(0)}</td></tr>`;

        preferredOrder.forEach(channel => {
            if (comboChannels.includes(channel)) return;
            if (!todayData[channel] && !prevData[channel]) return;

            let totalToday = 0;
            let totalPrev = 0;
            let alert = false;

            let row = `<tr class="even:bg-gray-50"><td class="border px-2 py-1 font-semibold">${channel}</td>`;
            timeRanges.forEach(range => {
                const today = todayData[channel]?.[range] || 0;
                const prev = prevData[channel]?.[range] || 0;
                const diff = getPercentDiff(today, prev);
                const rawDiff = prev === 0 ? 0 : ((today - prev) / prev) * 100;
                const isAlert = prev > 0 && today < prev * 0.5;

                let colorClass = rawDiff < 0 ? 'text-red-500 font-bold' : 'text-green-500 font-bold';
                if (isAlert) colorClass = 'text-red-700 font-extrabold';
                row += `<td class="border px-2 py-1 text-left">${today}</td>`;
                row += `<td class="border px-2 py-1 text-left ${colorClass}">${diff}</td>`;
                if (isAlert) alert = true;

                totalToday += today;
                totalPrev += prev;
            });

            const status = alert ? '🚩' : (totalToday < totalPrev * 0.3 ? '🚩 below 30%' : 'within 30% of the benchmark');
            row += `<td class="border px-2 py-1 font-bold">${totalToday}</td><td class="border px-2 py-1">${status}</td></tr>`;
            html += row;

            html += `<tr><td class="border px-2 py-1 text-gray-500 italic">Benchmark</td>`;
            timeRanges.forEach(range => {
                const value = prevData[channel]?.[range] || 0;
                html += `<td class="border px-2 py-1 text-left" colspan="2">${value}</td>`;
            });
            html += `<td class="border px-2 py-1 text-left" colspan="2">${totalPrev}</td></tr>`;

            html += `<tr><td class="border px-2 py-1 text-gray-500 italic">Alert below 50% of Benchmark</td>`;
            timeRanges.forEach(() => {
                html += `<td class="border px-2 py-1 text-center" colspan="2">—</td>`;
            });
            html += `<td class="border px-2 py-1" colspan="2"></td></tr>`;

            html += `<tr><td class="border px-2 py-1 text-gray-500 italic">50% of Benchmark</td>`;
            timeRanges.forEach(range => {
                const val = (prevData[channel]?.[range] || 0) / 2;
                html += `<td class="border px-2 py-1 text-left" colspan="2">${val.toFixed(0)}</td>`;
            });
            html += `<td class="border px-2 py-1 text-left" colspan="2">${(totalPrev / 2).toFixed(0)}</td></tr>`;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
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
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    selectedPastDate = yesterday.toISOString().split('T')[0];

    document.getElementById('pastDate').value = selectedPastDate;

    renderPast(selectedPastDate);
});