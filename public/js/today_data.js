document.addEventListener('DOMContentLoaded', function () {
    const timeRanges = [{
            label: '12AM - 8AM',
            start: 0,
            end: 8
        },
        {
            label: '9AM - 10AM',
            start: 9,
            end: 10
        },
        {
            label: '11AM - 2PM',
            start: 11,
            end: 14
        },
        {
            label: '3PM - 5PM',
            start: 15,
            end: 17
        },
        {
            label: '6PM - 9PM',
            start: 18,
            end: 21
        },
        {
            label: '10PM - 11PM',
            start: 22,
            end: 23
        }
    ];

    let currentRange = null;

    function getToday() {
        const today = new Date();

        const datePart = today.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const weekday = today.toLocaleDateString('en-US', {
            weekday: 'long'
        });

        return `${datePart} - ${weekday}`;
    }

    function getCurrentTimeRange() {
        const now = new Date();
        const hour = now.getHours();
        return timeRanges.find(range => hour >= range.start && hour <= range.end);
    }

    function loadSalesData() {
        axios.get('/api/today-sales')
            .then(function (response) {
                const data = response.data;
                const container = document.getElementById('today-sales-data');
                const today = getToday();

                let html = `
                     <h1 class="text-center text-black"> Sales as of Today (${today})</h1>
                    <table class="min-w-full border border-gray-300 text-sm text-left text-gray-700">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="border border-gray-300 px-4 py-2 font-medium">Channel</th>`;
                timeRanges.forEach(range => {
                    html += `<th class="border border-gray-300 px-4 py-2 font-medium">${range.label}</th>`;
                });
                html += `</tr></thead><tbody>`;

                const preferredOrder = ["Edisons", "Mytopia", "eBay", "BigW", "Mydeals", "Kogan", "Bunnings"];

                preferredOrder.forEach(channel => {
                    html += `<tr class="even:bg-gray-50">`;
                    html += `<td class="border border-gray-300 px-4 py-2 font-semibold">${channel}</td>`;
                    timeRanges.forEach(range => {
                        const value = data[channel]?.[range.label];
                        html += `<td class="border border-gray-300 px-4 py-2 text-right">${value != null ? value : ''}</td>`;
                    });
                    html += `</tr>`;
                });

                html += `</tbody></table>`;
                container.innerHTML = html;
            })
            .catch(function (error) {
                console.error('Error fetching sales data:', error);
            });
    }

    setInterval(() => {
        const newRange = getCurrentTimeRange();
        if (!currentRange || newRange.label !== currentRange.label) {
            currentRange = newRange;
            loadSalesData();
        }
    }, 60000);

    currentRange = getCurrentTimeRange();
    loadSalesData();
});
