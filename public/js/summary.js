
document.addEventListener('DOMContentLoaded', function () {
  Promise.all([
    axios.get('/api/today-sales'),
    axios.get('/api/prev-sales')
  ]).then(([todayRes, prevRes]) => {
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

    const preferredOrder = ["eBay", "BigW", "Mydeals", "Kogan", "Bunnings"];
    const container = document.getElementById('summary-report');

    // const sumRanges = (data, channels) => {
    //   return timeRanges.reduce((acc, range) => {
    //     return acc + channels.reduce((sum, ch) => sum + (data[ch]?.[range] || 0), 0);
    //   }, 0);
    // };

    const getPercentDiff = (today, prev) => {
      if (prev === 0) return today > 0 ? '#DIV/0!' : '0.00%';
      return (((today - prev) / prev) * 100).toFixed(2) + '%';
    };

    let html = `<table class="min-w-full border border-gray-300 text-sm text-left text-gray-700">
      <thead class="bg-gray-100">
        <tr><th class="border px-2 py-1">Sales Channel</th>`;
    timeRanges.forEach(range => {
      html += `<th class="border px-2 py-1" style="background-color: #00FFFF;">${range}</th><th class="border px-2 py-1">% Diff</th>`;
    });
    html += `<th class="border px-2 py-1">TOTAL</th><th class="border px-2 py-1">Total Sales Status</th></tr>
      </thead><tbody>`;

    const comboChannels = ["Edisons", "Mytopia"];
    const comboToday = {};
    const comboPrev = {};
    let comboTotalToday = 0;
    let comboTotalPrev = 0;
    let alertFlag = false;

    html += `<tr class="even:bg-gray-50"><td class="border px-2 py-1 font-semibold">Edisons + Mytopia</td>`;
    timeRanges.forEach(range => {
      const todayVal = comboChannels.reduce((sum, ch) => sum + (todayData[ch]?.[range] || 0), 0);
      const prevVal = comboChannels.reduce((sum, ch) => sum + (prevData[ch]?.[range] || 0), 0);
      const percentDiff = getPercentDiff(todayVal, prevVal);
      const below50 = prevVal > 0 && todayVal < prevVal * 0.5;
      if (below50) alertFlag = true;

      html += `<td class="border px-2 py-1 text-left">${todayVal}</td>`;
      html += `<td class="border px-2 py-1 text-left ${below50 ? 'text-red-500 font-bold' : 'text-green-500 font-bold'}">${percentDiff}</td>`;

      comboToday[range] = todayVal;
      comboPrev[range] = prevVal;
      comboTotalToday += todayVal;
      comboTotalPrev += prevVal;
    });

    let comboStatus = alertFlag ? '🚩' : (comboTotalToday < comboTotalPrev * 0.3 ? '🚩 below 30%' : 'within 30% of the benchmark');
    html += `<td class="border px-2 py-1 text-left font-bold">${comboTotalToday}</td><td class="border px-2 py-1">${comboStatus}</td></tr>`;

    html += `<tr><td class="border px-2 py-1 text-gray-500 italic">Benchmark</td>`;
    timeRanges.forEach(range => {
      html += `<td class="border px-2 py-1 text-left" colspan="2">${comboPrev[range]}</td>`;
    });
    html += `<td class="border px-2 py-1 text-left" colspan="2">${comboTotalPrev}</td></tr>`;

    html += `<tr><td class="border px-2 py-1 text-gray-500 italic">Alert below 50% of Benchmark</td>`;
    timeRanges.forEach(range => {
      const alert = comboPrev[range] > 0 && comboToday[range] < comboPrev[range] * 0.5 ? '🚩' : '';
      html += `<td class="border px-2 py-1 text-center text-red-500" colspan="2">${alert}</td>`;
    });
    html += `<td class="border px-2 py-1" colspan="2"></td></tr>`;

    html += `<tr><td class="border px-2 py-1 text-gray-500 italic">50% of Benchmark</td>`;
    timeRanges.forEach(range => {
      html += `<td class="border px-2 py-1 text-left" colspan="2">${(comboPrev[range] / 2).toFixed(0)}</td>`;
    });
    html += `<td class="border px-2 py-1 text-left" colspan="2">${(comboTotalPrev / 2).toFixed(0)}</td></tr>`;

    preferredOrder.forEach(channel => {
      if (!todayData[channel] && !prevData[channel]) return;

      let totalToday = 0;
      let totalPrev = 0;
      let row = `<tr class="even:bg-gray-50"><td class="border px-2 py-1 font-semibold">${channel}</td>`;
      let alert = false;

      timeRanges.forEach(range => {
        const today = todayData[channel]?.[range] || 0;
        const prev = prevData[channel]?.[range] || 0;
        const diff = getPercentDiff(today, prev);
        const isAlert = prev > 0 && today < prev * 0.5;
        if (isAlert) alert = true;

        row += `<td class="border px-2 py-1 text-left">${today}</td>`;
        row += `<td class="border px-2 py-1 text-left ${isAlert ? 'text-red-500 font-bold' : 'text-green-500 font-bold'}">${diff}</td>`;

        totalToday += today;
        totalPrev += prev;
      });

      const status = alert ? '🚩' : (totalToday < totalPrev * 0.3 ? '🚩 below 30%' : 'within 30% of the benchmark');
      row += `<td class="border px-2 py-1 text-left font-bold">${totalToday}</td><td class="border px-2 py-1 text-black">${status}</td></tr>`;
      html += row;

      html += `<tr><td class="border px-2 py-1 text-gray-500 italic">Benchmark</td>`;
      timeRanges.forEach(range => {
        html += `<td class="border px-2 py-1 text-left" colspan="2">${prevData[channel]?.[range] || 0}</td>`;
      });
      html += `<td class="border px-2 py-1 text-left" colspan="2">${totalPrev}</td></tr>`;

      html += `<tr><td class="border px-2 py-1 text-gray-500 italic">Alert below 50% of Benchmark</td>`;
      timeRanges.forEach(range => {
        const today = todayData[channel]?.[range] || 0;
        const prev = prevData[channel]?.[range] || 0;
        const flag = prev > 0 && today < prev * 0.5 ? '🚩' : '';
        html += `<td class="border px-2 py-1 text-center text-red-500" colspan="2">${flag}</td>`;
      });
      html += `<td class="border px-2 py-1" colspan="2"></td></tr>`;

      html += `<tr><td class="border px-2 py-1 text-gray-500 italic">50% of Benchmark</td>`;
      timeRanges.forEach(range => {
        html += `<td class="border px-2 py-1 text-left" colspan="2">${((prevData[channel]?.[range] || 0) / 2).toFixed(0)}</td>`;
      });
      html += `<td class="border px-2 py-1 text-left" colspan="2">${(totalPrev / 2).toFixed(0)}</td></tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
  }).catch(err => {
    console.error('Failed to load summary report:', err);
  });
});