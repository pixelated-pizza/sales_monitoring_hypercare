document.addEventListener('DOMContentLoaded', () => {
    const weatherBox = document.getElementById('weather-forecast');

    fetch('https://api.open-meteo.com/v1/forecast?latitude=7.1907&longitude=125.4553&current=temperature_2m,weathercode&timezone=auto')
        .then(res => res.json())
        .then(data => {
            const temp = data.current.temperature_2m;
            const code = data.current.weathercode;

            const conditions = {
                0: 'Clear Skies ☀️',
                1: 'Mostly Clear 🌤️',
                2: 'Partly Cloudy ⛅',
                3: 'Overcast ☁️',
                45: 'Foggy 🌫️',
                48: 'Dense Fog 🌫️',
                51: 'Light Drizzle 🌦️',
                53: 'Moderate Drizzle 🌦️',
                55: 'Heavy Drizzle 🌧️',
                61: 'Light Rain 🌧️',
                63: 'Moderate Rain 🌧️',
                65: 'Heavy Rain ⛈️',
                66: 'Rain Showers 🌦️',
                67: 'Heavy Rain Showers ⛈️',
                80: 'Isolated Rain 🌦️',
                81: 'Scattered Showers 🌧️',
                82: 'Widespread Rain ⛈️',
                95: 'Thunderstorm ⚡',
                96: 'Thunderstorm w/ Hail ⛈️',
                99: 'Severe Thunderstorm 🌩️'
            };


            weatherBox.innerHTML = `
                <div class="bg-gray-900 text-white dark:bg-gray-800 dark:text-white p-4 rounded-lg shadow-md w-full">
                    <div class="text-xs uppercase tracking-wide text-gray-400 mb-1">Davao City, Philippines</div>
                    <div class="mt-1 text-md font-bold">${conditions[code] || '—'}</div>
                    <div class="text-lg font-extrabold mt-1">${temp}°C</div>
                </div>
            `;


        })
        .catch(() => {
            weatherBox.innerHTML = 'Unable to load weather 🌧️';
        });
});
