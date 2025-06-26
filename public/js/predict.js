document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('predictionChart').getContext('2d');
    const channelSelect = document.getElementById('channelSelect');
    const predictionDateLabel = document.getElementById('prediction-date');
    const loader = document.getElementById('load-prediction');
    let chart;

    function showLoader() {
        loader.style.display = 'block';
    }

    function hideLoader() {
        loader.style.display = 'none';
    }

    showLoader();

    axios.get('/api/predict-sales')
        .then(response => {
            const data = response.data;
            const allChannels = Object.keys(data);

            const colors = ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

            const allTimeBuckets = ["1AM - 8AM", "9AM - 10AM", "11AM - 2PM", "3PM - 5PM", "6PM - 9PM", "10PM - 12AM"];
            const currentHour = new Date().getHours();

            const timeBucketMap = {
                "1AM - 8AM": [1, 8],
                "9AM - 10AM": [9, 10],
                "11AM - 2PM": [11, 14],
                "3PM - 5PM": [15, 17],
                "6PM - 9PM": [18, 21],
                "10PM - 12AM": [22, 23, 0],
            };

            const remainingBuckets = allTimeBuckets.filter(bucket => {
                return timeBucketMap[bucket].some(h => h > currentHour || h === 0 && currentHour < 1);
            });



            const today = new Date();
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            predictionDateLabel.textContent = 'Sales Forecast: ' + today.toLocaleDateString('en-AU', options);


            allChannels.forEach(channel => {
                const option = document.createElement('option');
                option.value = channel;
                option.textContent = channel;
                channelSelect.appendChild(option);
            });


            function buildDatasets(selectedChannel) {
                const currentHour = new Date().getHours();
                const filtered = selectedChannel === 'all' ? allChannels : [selectedChannel];

                return filtered.map((channel, index) => {
                    const color = colors[index % colors.length];

                    const dataPoints = allTimeBuckets.map(bucket => {
                        const hours = timeBucketMap[bucket];
                        const latestHour = Math.max(...hours);
                        const isFuture = latestHour > currentHour || (latestHour === 0 && currentHour < 1);
                        return {
                            value: data[channel][bucket] ?? 0,
                            isFuture
                        };
                    });

                    return {
                        label: `${channel}`,
                        data: dataPoints.map(dp => dp.value),
                        borderColor: color,
                        backgroundColor: color,
                        borderDash: [],
                        segment: {
                            borderDash: ctx => {
                                const i = ctx.p0DataIndex;
                                return dataPoints[i].isFuture ? [8, 4] : [];
                            }
                        },
                        fill: false,
                        tension: 0
                    };
                });
            }




            function renderChart(selectedChannel = 'all') {
                const datasets = buildDatasets(selectedChannel);
                if (chart) chart.destroy();

                chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: allTimeBuckets,
                        datasets: datasets
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Predicted Sales by Channel'
                            },
                            legend: {
                                position: 'bottom'
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Predicted Orders'
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Time Buckets'
                                }
                            }
                        }
                    }
                });
            }


            renderChart();
            channelSelect.addEventListener('change', () => {
                renderChart(channelSelect.value);
            });

            hideLoader();
        })
        .catch(error => {
            console.error('Error fetching prediction data:', error);
            loader.innerHTML = '<p class="text-red-600">Failed to load graph.</p>';
        });
});
