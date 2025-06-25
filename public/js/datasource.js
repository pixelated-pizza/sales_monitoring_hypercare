let allData = [];
let filterDate = null;
let currentPage = 1;
const rowsPerPage = 20;

function renderDataSource(selectedDate = null) {
    const container = document.getElementById('data-source');
    const paginationContainer = document.getElementById('pagination');
    const loadData = document.getElementById('load-data');

    loadData.style.display = "block";
    container.innerHTML = '';
    paginationContainer.innerHTML = '';

    const selectedChannel = document.getElementById('channelFilter').value;
    const selectedTimeRange = document.getElementById('timeFilter').value;
    const selectedStatus = document.getElementById('statusFilter').value;

    if (selectedDate) {
        filterDate = selectedDate;
    }

    const params = {};
    if (filterDate) {
        params.date = filterDate;
    }

    axios.get('/api/data-source', { params })
        .then(response => {
            loadData.style.display = "none";
            let data = response.data;

            if (!Array.isArray(data) || data.length === 0) {
                container.innerHTML = '<div class="text-gray-600">No data available.</div>';
                return;
            }

 
            if (selectedTimeRange) {
                const rangeMap = {
                    "1AM - 8AM": [1, 8],
                    "9AM - 10AM": [9, 10],
                    "11AM - 2PM": [11, 14],
                    "3PM - 5PM": [15, 17],
                    "6PM - 9PM": [18, 21],
                    "10PM - 12AM": [22, 23]
                };
                const [startHour, endHour] = rangeMap[selectedTimeRange] || [];
                data = data.filter(item => {
                    const orderHour = new Date(item.DatePlaced).getHours();
                    return orderHour >= startHour && orderHour <= endHour;
                });
            }

     
            if (selectedChannel) {
                data = data.filter(item => item.SalesChannel === selectedChannel);
            }

            if (selectedStatus) {
                data = data.filter(item => item.OrderStatus === selectedStatus);
            }

            allData = data;
            currentPage = 1;
            renderTablePage();
        })
        .catch(err => {
            loadData.style.display = "none";
            container.innerHTML = `<div class="text-red-600">Failed to load the data source.</div>`;
            console.error('Failed to load summary report:', err);
        });
}


function renderTablePage() {
    const container = document.getElementById('data-source');
    const paginationContainer = document.getElementById('pagination');
    const loadData = document.getElementById('load-data');

    loadData.style.display = "block";
    container.innerHTML = '';
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(allData.length / rowsPerPage);
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = allData.slice(start, end);

    let html = `
        <div class="overflow-x-auto">
            <table class="table-auto w-full text-sm border border-collapse border-gray-300 dark:border-gray-700">
                <thead class="bg-gray-200 dark:bg-gray-800">
                    <tr>
                        <th class="border px-2 py-1">Order ID</th>
                        <th class="border px-2 py-1">Status</th>
                        <th class="border px-2 py-1">Channel</th>
                        <th class="border px-2 py-1">Date</th>
                        <th class="border px-2 py-1">SKU</th>
                        <th class="border px-2 py-1">Qty</th>
                    </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
    `;

    pageData.forEach(item => {
        html += `
            <tr>
                <td class="border px-2 py-1">${item.OrderID}</td>
                <td class="border px-2 py-1">${item.OrderStatus}</td>
                <td class="border px-2 py-1">${item.SalesChannel}</td>
                <td class="border px-2 py-1">${item.DatePlaced}</td>
                <td class="border px-2 py-1">${item.OrderLineSKU}</td>
                <td class="border px-2 py-1">${item.OrderLineQty || '-'}</td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    loadData.style.display = "none";

    container.innerHTML = html;


   
    const maxVisibleButtons = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage < maxVisibleButtons - 1) {
        startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }


    if (startPage > 1) {
        const firstBtn = document.createElement('button');
        firstBtn.innerText = '1';
        firstBtn.className = `px-2 py-1 border rounded ${currentPage === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`;
        firstBtn.addEventListener('click', () => {
            currentPage = 1;
            renderTablePage();
        });
        paginationContainer.appendChild(firstBtn);

        if (startPage > 2) {
            const dots = document.createElement('span');
            dots.innerText = '...';
            dots.className = 'px-2';
            paginationContainer.appendChild(dots);
        }
    }


    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.className = `px-2 py-1 border rounded ${i === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`;
        btn.addEventListener('click', () => {
            currentPage = i;
            renderTablePage();
        });
        paginationContainer.appendChild(btn);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dots = document.createElement('span');
            dots.innerText = '...';
            dots.className = 'px-2';
            paginationContainer.appendChild(dots);
        }

        const lastBtn = document.createElement('button');
        lastBtn.innerText = totalPages;
        lastBtn.className = `px-2 py-1 border rounded ${currentPage === totalPages ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`;
        lastBtn.addEventListener('click', () => {
            currentPage = totalPages;
            renderTablePage();
        });
        paginationContainer.appendChild(lastBtn);
    }

}

document.addEventListener('DOMContentLoaded', function () {
    renderDataSource(); 

    document.getElementById('timeFilter').addEventListener('change', () => renderDataSource(filterDate));
    document.getElementById('channelFilter').addEventListener('change', () => renderDataSource(filterDate));
    document.getElementById('statusFilter').addEventListener('change', () => renderDataSource(filterDate));

    document.getElementById('dateFilter').addEventListener('change', function () {
        filterDate = this.value;
        renderDataSource(filterDate);
    });
});
