let hasLoaded = false;
let previousOrders = {};  
let notifications = [];   
function renderSummary() {
    const loadingElem = document.getElementById('loading');
    const container = document.getElementById('summary-report');
 
    if (!hasLoaded) {
        loadingElem.style.display = 'block';
        container.innerHTML = '';
    }

    Promise.all([
        axios.get('/api/today-sales'),
        axios.get('/api/prev-sales')
    ]).then(([todayRes, prevRes]) => {
        notifications = [];
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

        const preferredOrder = ["Edisons", "Mytopia", "eBay", "BigW", "Mydeals", "Kogan", "Bunnings", "Amazon DF"];
        const now = new Date();
        const lastWeekOfToday = new Date(now);
        lastWeekOfToday.setDate(lastWeekOfToday.getDate() - 7);

        const formatDate = (d) => {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return d.toLocaleDateString(undefined, options);
        };

        let html = `<div class="mb-2 font-semibold text-gray-700">Sales Data: ${formatDate(now)} versus ${formatDate(lastWeekOfToday)} (Benchmark)</div>`;
        html += `<div class="mb-2 font-semibold text-gray-700"><i><b>Note:</b> Benchmark values refer to the same weekday from the previous week (${formatDate(lastWeekOfToday)})</i></div>`;

        const getPercentDiff = (sales, benchmark) => {
            if (benchmark === 0) {
                if (sales === 0) return '0.00%';
                return '';
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

            if (timeStr.trim().toUpperCase() === '12AM') return 0; 
            if (timeStr.trim().toUpperCase() === '12PM') return 12; 

            return isPM ? (hour === 12 ? 12 : hour + 12) : hour; 
        };

        const isFutureRange = (range) => {
            const currentHour = new Date().getHours();
            const startHour = parseHour(range.split(' - ')[0].trim());
            return currentHour < startHour;
        };

        const isCurrentRange = (range) => {
            const now = new Date();
            const currentHour = now.getHours();

            const [start, end] = range.split(' - ').map(t => t.trim());
            const startHour = parseHour(start);
            const endHour = parseHour(end);

            if (endHour < startHour) {
                return currentHour >= startHour || currentHour < endHour;
            }
            return currentHour >= startHour && currentHour < endHour;
        };

        const allTimeRangesCompleted = () => timeRanges.every(range => !isFutureRange(range));

        html += `<div class="overflow-auto max-w-full"><table class="min-w-full border border-gray-300 text-sm text-left text-gray-700"><thead class="bg-blue-50 sticky top-0 z-10"><tr><th class="px-2 py-1 bg-blue-100">Sales Channel</th>`;

        timeRanges.forEach(range => {
            html += `<th class="px-2 py-1 bg-cyan-100 text-xs" style="background-color: #00FFFF;">${range}</th><th class="border px-2 py-1 bg-cyan-50 text-xs">% Diff</th>`;
        });
        html += `</tr></thead><tbody>`;

        const comboChannels = ["Edisons", "Mytopia"];
        const comboToday = {};
        const comboPrev = {};

        comboChannels.forEach(channel => {
            let row = `<tr class="even:bg-gray-50" style="border: 2px solid black;"><td class="border px-2 py-1 font-semibold">${channel}</td>`;
            timeRanges.forEach(range => {
                const future = isFutureRange(range);
                const today = todayData[channel]?.[range] || 0;
                const prev = prevData[channel]?.[range] || 0;
                row += `<td class="border px-2 py-1 text-left text-blue-500 font-semibold ${future ? 'text-gray-400' : isCurrentRange(range) ? 'glow-pulse' : ''}">${future ? '' : today}</td>`;
                row += `<td class="border px-2 py-1 text-left text-gray-400"></td>`;
                comboToday[range] = (comboToday[range] || 0) + today;
                comboPrev[range] = (comboPrev[range] || 0) + prev;
            });
            row += `</tr>`;
            html += row;
        });

        html += `<tr class="bg-gray-200" style="border: 2px solid black;"><td class="px-2 py-1 font-bold">TOTAL (Edisons + Mytopia)</td>`;
        timeRanges.forEach(range => {
            const today = comboToday[range] || 0;
            const prev = comboPrev[range] || 0;
            const future = isFutureRange(range);
            const diff = getPercentDiff(today, prev);
            const colorClass = today < prev * 0.5 ? 'text-red-700 font-extrabold' : 'text-green-500 font-bold';

            html += `<td class="border px-2 py-1 text-left text-blue-500 font-semibold ${future ? 'text-gray-400' : isCurrentRange(range) ? 'glow-pulse' : ''}">${future ? '' : today}</td>`;
            html += `<td class="border px-2 py-1 text-left ${future ? 'text-gray-400' : colorClass} ${future ? '' : ''}">${future ? '' : diff}</td>`;
        });
        html += `</tr>`;

        html += `<tr class="border-t-2"><td class="border px-2 py-1 text-gray-500 italic">Benchmark</td>`;
        timeRanges.forEach(range => {
            const val = comboPrev[range] || 0;
            html += `<td class="border px-2 py-1 text-left text-yellow-800 font-semibold" colspan="2">${isFutureRange(range) ? '' : val}</td>`;
        });
        html += `</tr>`;

        html += `<tr><td class="border px-2 py-1 text-gray-500 italic">Alert below 50% of Benchmark</td>`;
        timeRanges.forEach(range => {
            if (allTimeRangesCompleted()) {
                const today = comboToday[range] || 0;
                const prev = comboPrev[range] || 0;
                const isRedFlag = prev > 0 && today < prev * 0.5;
                html += `<td class="border px-2 py-1 text-center font-bold text-red-700" colspan="2">${isRedFlag ? '🚩' : ''}</td>`;
            } else {
                html += `<td class="border px-2 py-1 text-center" colspan="2"></td>`;
            }
        });
        html += `</tr>`;

        html += `<tr><td class="border px-2 py-1 text-gray-500 italic">50% of Benchmark</td>`;
        timeRanges.forEach(range => {
            const val = comboPrev[range] || 0;
            html += `<td class="border px-2 py-1 text-left text-red-700 font-semibold" colspan="2">${isFutureRange(range) ? '' : (val / 2).toFixed(0)}</td>`;
        });
        html += `</tr>`;

        preferredOrder.forEach(channel => {
            if (comboChannels.includes(channel)) return;
            if (!todayData[channel] && !prevData[channel]) return;

            let row = `<tr class="bg-gray-200" style="border: 2px solid black;"><td class="border px-2 py-1 font-bold">${channel}</td>`;
            timeRanges.forEach(range => {
                const future = isFutureRange(range);
                const today = todayData[channel]?.[range] || 0;
                const prev = prevData[channel]?.[range] || 0;
                const diff = getPercentDiff(today, prev);
                const colorClass = today < prev * 0.5 ? 'text-red-700 font-extrabold': 'text-green-500 font-bold';

                row += `<td class="border px-2 py-1 text-left text-blue-500 font-semibold ${future ? 'text-gray-400' : isCurrentRange(range) ? 'glow-pulse' : ''}">${future ? '' : today}</td>`;
                row += `<td class="border px-2 py-1 text-left ${future ? 'text-gray-400' : colorClass} ${future ? '' : ''}">${future ? '' : diff}</td>`;

            });
            row += `</tr>`;
            html += row;

            html += `<tr><td class="border px-2 py-1 text-gray-500 italic">Benchmark</td>`;
            timeRanges.forEach(range => {
                const val = prevData[channel]?.[range] || 0;
                html += `<td class="border px-2 py-1 text-left text-yellow-800 font-semibold" colspan="2">${isFutureRange(range) ? '' : val}</td>`;
            });
            html += `</tr>`;

            html += `<tr><td class="border px-2 py-1 text-gray-500 italic">Alert below 50% of Benchmark</td>`;
            timeRanges.forEach(range => {
                if (allTimeRangesCompleted()) {
                    const today = todayData[channel]?.[range] || 0;
                    const prev = prevData[channel]?.[range] || 0;
                    const isRedFlag = prev > 0 && today < prev * 0.5;
                    html += `<td class="border px-2 py-1 text-center font-bold text-red-700" colspan="2">${isRedFlag ? '🚩' : ''}</td>`;
                } else {
                    html += `<td class="border px-2 py-1 text-center" colspan="2"></td>`;
                }
            });
            html += `</tr>`;

            html += `<tr><td class="border px-2 py-1 text-gray-500 italic">50% of Benchmark</td>`;
            timeRanges.forEach(range => {
                const val = prevData[channel]?.[range] || 0;
                html += `<td class="border px-2 py-1 text-left text-red-700 font-semibold" colspan="2">${isFutureRange(range) ? '' : (val / 2).toFixed(0)}</td>`;
            });
            html += `</tr>`;
        });

        html += `</tbody></table></div>`;
        container.innerHTML = html;

        const updatedAt = new Date();
        document.getElementById('last-updated').textContent = 'Updated just now';

        if (window.updateTimer) clearInterval(window.updateTimer);
            window.updateTimer = setInterval(() => {
            const now = new Date();
            const minutesAgo = Math.floor((now - updatedAt) / 60000);
            document.getElementById('last-updated').textContent =
            minutesAgo < 1 ? 'Updated just now' : `Updated ${minutesAgo} min${minutesAgo > 1 ? 's' : ''} ago`;
        }, 30000); 

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