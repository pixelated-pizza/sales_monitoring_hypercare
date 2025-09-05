// document.addEventListener('DOMContentLoaded', function () {
//     const allChannels = ["Edisons", "Mytopia", "eBay", "BigW", "Mydeals", "Kogan", "Bunnings"];

//     const chart = new ApexCharts(document.querySelector("#liveOrdersChart"), {
//         chart: {
//             type: 'line',
//             height: 300,
//             animations: {
//                 enabled: true,
//                 easing: 'linear',
//                 dynamicAnimation: {
//                     speed: 1000
//                 }
//             },
//             toolbar: { show: false },
//             zoom: { enabled: false }
//         },
//         series: allChannels.map(channel => ({
//             name: channel,
//             data: []
//         })),
//         xaxis: {
//             type: 'datetime',
//             range: 60000,
//             labels: {
//                 format: 'HH:mm:ss',
//                 datetimeUTC: false
//             }
//         },
//         yaxis: {
//             min: 0,
//             title: { text: 'Orders Captured' }
//         },
//         stroke: {
//             curve: 'smooth'
//         }
//     });

//     chart.render();

//     let lastTimestamp = Date.now();

//     setInterval(() => {
//         axios.get('/api/live-orders', {
//             params: { since: lastTimestamp }
//         })
//         .then(res => {
//             const newData = res.data.data ?? {};
//             const newTimestamp = res.data.timestamp ?? Date.now();

    
//             const updatedSeries = chart.w.globals.series.map(series => {
//                 const channel = series.name;
//                 let updatedData = [...series.data];

             
//                 for (const [ts, entry] of Object.entries(newData)) {
//                     const timestamp = parseInt(ts);
//                     const y = entry[channel] ?? 0;

//                     if (y > 0) {
//                         updatedData.push({ x: timestamp, y });
//                     }
//                 }

               
//                 updatedData = updatedData.slice(-60);

//                 return { name: channel, data: updatedData };
//             });

//             chart.updateSeries(updatedSeries);
//             lastTimestamp = newTimestamp;

//             document.getElementById("last-updated").textContent =
//                 "Updated: " + luxon.DateTime.now().toLocaleString(luxon.DateTime.TIME_WITH_SECONDS);
//         })
//         .catch(err => {
//             console.error('Live fetch failed:', err);
//         });
//     }, 1000);
// });