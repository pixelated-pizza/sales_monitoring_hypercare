document.addEventListener('DOMContentLoaded', () => {
    const weatherBox = document.getElementById('weather-forecast');

    fetch('https://api.open-meteo.com/v1/forecast?latitude=7.1907&longitude=125.4553&hourly=temperature_2m,weathercode&timezone=auto')
        .then(res => res.json())
        .then(data => {
            const hours = data.hourly.time;
            const temps = data.hourly.temperature_2m;
            const codes = data.hourly.weathercode;

            const now = new Date();

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

            let nextHourHTML = '';
            for (let i = 0; i < hours.length; i++) {
                const forecastTime = new Date(hours[i]);
                if (forecastTime > now) {
                    const timeStr = forecastTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                    const temp = temps[i];
                    const code = codes[i];
                    const condition = conditions[code] || 'Unknown';

                    nextHourHTML = `
                        <div class="bg-gray-900 text-white dark:bg-gray-800 dark:text-white p-4 rounded-lg shadow-md w-full">
                            <div class="text-sm text-gray-300 mb-1">Davao City, Philippines</div>
                            <div class="text-md font-bold mb-1">${condition}</div>
                            <div class="text-lg font-extrabold mb-1">${temp}°C</div>
                            <div class="text-xs text-gray-400">Forecast for ${timeStr}</div>
                        </div>
                    `;
                    break; 
                }
            }

            weatherBox.innerHTML = nextHourHTML || 'No forecast data available for the next hour.';
        })
        .catch(() => {
            weatherBox.innerHTML = 'Unable to load forecast 🌧️';
        });
});
