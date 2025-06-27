document.addEventListener('DOMContentLoaded', function () {
    const chart = new ApexCharts(document.querySelector("#liveOrdersChart"), {
        chart: {
            type: 'line',
            height: 300,
            animations: {
                enabled: true,
                easing: 'linear',
                dynamicAnimation: {
                    speed: 1000
                }
            },
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false
            }
        },
        series: [{
            name: 'Live Orders',
            data: []
        }],
        xaxis: {
            type: 'datetime',
            range: 60000,
            labels: {
                format: 'HH:mm:ss',
                datetimeUTC: false
            }
        },

        yaxis: {
            min: 0,
            title: {
                text: 'Orders Captured'
            }
        },
        stroke: {
            curve: 'smooth'
        }
    });

    chart.render();

    let lastTimestamp = Date.now();

    setInterval(() => {
        const nowSydney = luxon.DateTime.now().setZone('Australia/Sydney').toMillis();

        axios.get('/api/live-orders', {
                params: {
                    since: lastTimestamp
                }
            })
            .then(res => {
                const newOrders = res.data.new_orders ?? 0;

                chart.appendData([{
                    data: [{
                        x: nowSydney,
                        y: newOrders
                    }]
                }]);

                const maxPoints = 60;
                if (chart.w.globals.series[0].data.length > maxPoints) {
                    chart.updateSeries([{
                        data: chart.w.globals.series[0].data.slice(-maxPoints)
                    }]);
                }

                lastTimestamp = res.data.timestamp ?? Date.now();

                document.getElementById("last-updated").textContent =
                    "Updated: " + luxon.DateTime.now().toLocaleString(luxon.DateTime.TIME_WITH_SECONDS);
            })
            .catch(err => {
                console.error('Live fetch failed:', err);
            });

    }, 1000);
});
