document.addEventListener('DOMContentLoaded', function () {
    axios.get('/api/prev-sales')
        .then(function (response) {
            const data = response.data;
            const container = document.getElementById('sales-data');

            const last_week = getLastWeekDate();

            const timeRanges = [
                '12AM - 8AM',
                '9AM - 10AM',
                '11AM - 2PM',
                '3PM - 5PM',
                '6PM - 9PM',
                '10PM - 11PM'
            ];

            let html = `
                 <h1 class="text-center text-black"> Sales from ${last_week}
                <table class="min-w-full border border-gray-300 text-sm text-left text-gray-700">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="border border-gray-300 px-4 py-2 font-medium">Channel</th>`;
            timeRanges.forEach(range => {
                html += `<th class="border border-gray-300 px-4 py-2 font-medium">${range}</th>`;
            });
            html += `</tr></thead><tbody>`;

            const preferredOrder = ["Edisons", "Mytopia", "eBay", "BigW", "Mydeals", "Kogan", "Bunnings"];

            preferredOrder.forEach(channel => {
                html += `<tr class="even:bg-gray-50">`;
                html += `<td class="border border-gray-300 px-4 py-2 font-semibold">${channel}</td>`;
                timeRanges.forEach(range => {
                    const sales = data[channel]?.[range] || "";
                    html += `<td class="border border-gray-300 px-4 py-2 text-right">${sales}</td>`;
                });
                html += `</tr>`;
            });

            html += `</tbody></table>`;
            container.innerHTML = html;
        })
        .catch(function (error) {
            console.error('Error fetching sales data:', error);
        });


});

function getLastWeekDate() {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);

    const datePart = lastWeek.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const weekday = lastWeek.toLocaleDateString('en-US', {
        weekday: 'long'
    });

    return `${datePart} - ${weekday}`;
}
