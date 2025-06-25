document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('predictionChart').getContext('2d');
    const channelSelect = document.getElementById('channelSelect');
    let chart;

    axios.get('/api/predict-sales')
        .then(response => {
            const data = response.data;
            const predictionDateLabel = document.getElementById('prediction-date');

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            const formattedDate = tomorrow.toLocaleDateString('en-AU', options);

            predictionDateLabel.textContent = 'Sales Prediction for: ' + formattedDate;
            const allChannels = Object.keys(data);
            const timeBuckets = ["1AM - 8AM", "9AM - 10AM", "11AM - 2PM", "3PM - 5PM", "6PM - 9PM", "10PM - 12AM"];
            const colors = ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];


            allChannels.forEach(channel => {
                const option = document.createElement('option');
                option.value = channel;
                option.textContent = channel;
                channelSelect.appendChild(option);
            });

            function buildDatasets(selectedChannel) {
                let filteredChannels = selectedChannel === 'all' ? allChannels : [selectedChannel];

                return filteredChannels.map((channel, index) => ({
                    label: channel + ' (Predicted)',
                    data: timeBuckets.map(tb => data[channel][tb] || 0),
                    borderColor: colors[index % colors.length],
                    backgroundColor: colors[index % colors.length],
                    borderDash: [8, 4],
                    fill: false,
                    tension: 0.3
                }));
            }

            function renderChart(selectedChannel = 'all') {
                const datasets = buildDatasets(selectedChannel);

                if (chart) {
                    chart.destroy();
                }

                chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: timeBuckets,
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
        })
        .catch(error => {
            console.error('Error fetching prediction data:', error);
        });
});
