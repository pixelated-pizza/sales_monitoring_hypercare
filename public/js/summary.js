let hasLoaded = false;
function renderSummary() {
    const loadingElem = document.getElementById('loading');
     const container = document.getElementById('summary-report');

    if(!hasLoaded){
        loadingElem.style.display = 'block';
        container.innerHTML = '';    
    }



    Promise.all([
        axios.get('/api/today-sales'),
        axios.get('/api/prev-sales')
    ]).then(([todayRes, prevRes]) => {
        loadingElem.style.display = 'none';
        hasLoaded = true;
        const todayData = todayRes.data;
        const prevData = prevRes.data;

        const timeRanges = [
            '1AM - 8AM',
            '9AM - 10AM',
            '11AM - 2PM',
            '3PM - 5PM',
            '6PM - 9PM',
            '10PM - 12AM'
        ];

        const preferredOrder = ["Edisons", "Mytopia", "eBay", "BigW", "Mydeals", "Kogan", "Bunnings"];
        const container = document.getElementById('summary-report');
        

        const now = new Date();
        const lastWeekOfToday = new Date(now);
        lastWeekOfToday.setDate(lastWeekOfToday.getDate() - 7);

        const formatDate = (d) => {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return d.toLocaleDateString(undefined, options);
        };

        var html = `<div class="mb-2 font-semibold text-gray-700">Sales Data: ${formatDate(now)} versus ${formatDate(lastWeekOfToday)}(Benchmark)</div>`;

        html += `<div class="mb-2 font-semibold text-gray-700"><i><b>Note: </b> Benchmark values refers to the data of the same weekday from the previous week (${formatDate(lastWeekOfToday)})</i></div>`;

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

        const parseHour = (timeStr) => {
            const hour = parseInt(timeStr, 10);
            const isPM = timeStr.toUpperCase().includes('PM');
            const isAM = timeStr.toUpperCase().includes('AM');

            if (hour === 12) {
                if (isAM) return 0;      
                if (isPM) return 12;     
            }

            let converted = isPM ? hour + 12 : hour;

            if (timeStr.trim().toUpperCase() === '12AM') return 24;

            return converted;
        };

        const isFutureRange = (range) => {
            const now = new Date();
            const currentHour = now.getHours();
            const endTimeStr = range.split(' - ')[1].trim();
            const endHour24 = parseHour(endTimeStr);
            return currentHour < endHour24;
        };

        const allTimeRangesCompleted = () => {
            return timeRanges.every(range => !isFutureRange(range));
        };

        html += `
            <div class="overflow-auto max-w-full">
            <table class="min-w-full border border-gray-300 text-sm text-left text-gray-700">
            <thead class="bg-blue-50 sticky top-0 z-10">
            <tr>
            <th class="px-2 py-1 bg-blue-100">Sales Channel</th>`;
        timeRanges.forEach(range => {
            html += `
                <th class="px-2 py-1 bg-cyan-100 text-xs" style="background-color: #00FFFF;">${range}</th>
                    <th class="border px-2 py-1 bg-cyan-50 text-xs">% Diff</th>`;
        });
        html += `<th class="border px-2 py-1">TOTAL</th></tr>
      </thead><tbody>`;

        const comboChannels = ["Edisons", "Mytopia"];
        let comboTodayTotal = 0;
        let comboPrevTotal = 0;
        const comboToday = {};
        const comboPrev = {};

        comboChannels.forEach(channel => {
            let row = `<tr class="even:bg-gray-50" style="border: 2px solid black;"><td class="border px-2 py-1 font-semibold">${channel}</td>`;

            timeRanges.forEach(range => {
                const future = isFutureRange(range);
                const today = todayData[channel]?.[range] || 0;
                const prev = prevData[channel]?.[range] || 0;
                const isAlert = !future && prev > 0 && today < prev * 0.5;

                if (isAlert) comboAlert = true;

                row += `<td class="border px-2 py-1 text-left ${future ? 'text-gray-400' : ''}">${future ? '—' : today}</td>`;
                row += `<td class="border px-2 py-1 text-left text-gray-400">—</td>`;

                comboToday[range] = (comboToday[range] || 0) + today;
                comboPrev[range] = (comboPrev[range] || 0) + prev;
                comboTodayTotal += today;
                comboPrevTotal += prev;
            });

            row += `<td class="border px-2 py-1 font-bold">—</td><td class="border px-2 py-1">—</td></tr>`;
            html += row;
        });

        html += `<tr class="bg-gray-200" style="border: 2px solid black;"><td class="px-2 py-1 font-bold">TOTAL (Edisons + Mytopia)</td>`;

        timeRanges.forEach(range => {
            const today = comboToday[range] || 0;
            const prev = comboPrev[range] || 0;
            const future = isFutureRange(range);
            const diff = getPercentDiff(today, prev);
            const colorClass = today < prev * 0.5 ? 'text-red-700 font-extrabold' : 'text-green-500 font-bold';

            html += `<td class="border px-2 py-1 text-left ${future ? 'text-gray-400' : ''}">${future ? '—' : today}</td>`;
            html += `<td class="border px-2 py-1 text-left ${future ? 'text-gray-400' : colorClass}">${future ? '—' : diff}</td>`;
        });

        html += `<td class="border px-2 py-1 font-bold">${comboTodayTotal}</td></tr>`;

        html += `<tr class="border-t-2"><td class="border px-2 py-1 text-gray-500 italic">Benchmark</td>`;
        timeRanges.forEach(range => {
            const isFuture = isFutureRange(range);
            const val = comboPrev[range] || 0;
            html += `<td class="border px-2 py-1 text-left" colspan="2">${isFuture ? '—' : val}</td>`;
        });

        html += `<td class="border px-2 py-1 text-left" colspan="2">${comboPrevTotal}</td></tr>`;

        html += `<tr><td class="border px-2 py-1 text-gray-500 italic">Alert below 50% of Benchmark</td>`;
        if (allTimeRangesCompleted()) {
            timeRanges.forEach(range => {
            const today = todayData[channel]?.[range] || 0;
            const prev = prevData[channel]?.[range] || 0;
            const isRedFlag = prev > 0 && today < prev * 0.5;
            html += `<td class="border px-2 py-1 text-center font-bold text-red-700" colspan="2">${isRedFlag ? '🚩' : ''}</td>`;
        });
        } else {
            timeRanges.forEach(() => {
                html += `<td class="border px-2 py-1 text-center" colspan="2">—</td>`;
            });
        }
        html += `<td class="border px-2 py-1 text-center bg-gray-100" colspan="2">—</td>`;



        html += `<tr><td class="border px-2 py-1 text-gray-500 italic">50% of Benchmark</td>`;
        timeRanges.forEach(range => {
            const isFuture = isFutureRange(range);
            const val = comboPrev[range] || 0;
            html += `<td class="border px-2 py-1 text-left" colspan="2">${isFuture ? '—' : (val / 2).toFixed(0)}</td>`;
        });

        preferredOrder.forEach(channel => {
            if (comboChannels.includes(channel)) return;
            if (!todayData[channel] && !prevData[channel]) return;

            let totalToday = 0;
            let totalPrev = 0;
            let alert = false;

            let row = `<tr class="bg-gray-200" style="border: 2px solid black;"><td class="border px-2 py-1 font-bold">${channel}</td>`;

            timeRanges.forEach(range => {
                const future = isFutureRange(range);
                const today = todayData[channel]?.[range] || 0;
                const prev = prevData[channel]?.[range] || 0;
                const diff = getPercentDiff(today, prev);
                const isAlert = !future && prev > 0 && today < prev * 0.5;

                if (!future) {
                    let colorClass = today < prev * 0.5 ? 'text-red-700 font-extrabold' : 'text-green-500 font-bold';
                    row += `<td class="border px-2 py-1 text-left">${today}</td>`;
                    row += `<td class="border px-2 py-1 text-left ${colorClass}">${diff}</td>`;
                    if (isAlert) alert = true;
                } else {
                    row += `<td class="border px-2 py-1 text-left text-gray-400">—</td><td class="border px-2 py-1 text-left text-gray-400">—</td>`;
                }

                totalToday += today;
                totalPrev += prev;
            });

            row += `<td class="border px-2 py-1 font-bold">${totalToday}</td></tr>`;
            html += row;

            html += `<tr><td class="border px-2 py-1 text-gray-500 italic">Benchmark</td>`;
            timeRanges.forEach(range => {
                const isFuture = isFutureRange(range);
                const value = prevData[channel]?.[range] || 0;
                html += `<td class="border px-2 py-1 text-left" colspan="2">${isFuture ? '—' : value}</td>`;
            });

            html += `<td class="border px-2 py-1 text-left" colspan="2">${totalPrev}</td></tr>`;

           html += `<tr><td class="border px-2 py-1 text-gray-500 italic">Alert below 50% of Benchmark</td>`;
           if (allTimeRangesCompleted()) {
                timeRanges.forEach(range => {
                    const today = todayData[channel]?.[range] || 0;
                    const prev = prevData[channel]?.[range] || 0;
                    const isRedFlag = prev > 0 && today < prev * 0.5;
                    html += `<td class="border px-2 py-1 text-center font-bold text-red-700" colspan="2">${isRedFlag ? '🚩' : '—'}</td>`;
                });
            } else {
                timeRanges.forEach(() => {
                    html += `<td class="border px-2 py-1 text-center" colspan="2">—</td>`;
                });
            }
            html += `<td class="border px-2 py-1 text-center bg-gray-100" colspan="2">—</td>`;


            html += `<tr><td class="border px-2 py-1 text-gray-500 italic">50% of Benchmark</td>`;
                timeRanges.forEach(range => {
                    const isFuture = isFutureRange(range);
                    const val = isFuture ? 0 : (prevData[channel]?.[range] || 0) / 2;
                    html += `<td class="border px-2 py-1 text-left" colspan="2">${isFuture ? '—' : val.toFixed(0)}</td>`;
                });
            });

        html += `</tbody></table>`;
        container.innerHTML = html;
    }).catch(err => {
        loadingElem.style.display = 'none';  
        container.innerHTML = `<div class="text-red-600">Failed to load summary report.</div>`;
        console.error('Failed to load summary report:', err);
    });
}

const getRefreshIntervalSummary = () => {
    const now = new Date();
    const hour = now.getHours();

    if (hour < 8) return 5 * 60 * 1000;        
    if (hour < 10) return 3 * 60 * 1000;       
    if (hour < 14) return 3 * 60 * 1000;       
    if (hour < 17) return 3 * 60 * 1000;       
    if (hour < 21) return 3 * 60 * 1000;       
    return 10 * 60 * 1000;                     
};

function schedRefSummary(){
    renderSummary();
    setTimeout(schedRefSummary, getRefreshIntervalSummary());
}

document.addEventListener('DOMContentLoaded', schedRefSummary);