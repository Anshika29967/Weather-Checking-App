// Replace this with your actual API key from OpenWeatherMap
const apiKey = 'f6ff4b780c6abb94bd0203e84293886f'; 
const apiUrl = 'https://api.openweathermap.org/data/2.5/';

// Test the API key first
async function testApiKey() {
    try {
        const response = await fetch(`${apiUrl}weather?q=London&appid=${apiKey}&units=metric`);
        const data = await response.json();
        if (data.cod === 401) {
            throw new Error('Invalid API key');
        }
        console.log('API key is valid');
    } catch (error) {
        console.error('API key validation failed:', error);
        alert('Please ensure you have entered a valid API key');
    }
}

document.addEventListener('DOMContentLoaded', testApiKey);

document.getElementById('searchButton').addEventListener('click', () => {
    const city = document.getElementById('city').value;
    if (city) {
        fetchWeather(city);
    } else {
        alert('Please enter a city name!');
    }
});

document.getElementById('currentLocationButton').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetchWeatherByCoords(lat, lon);
            },
            error => {
                console.error('Geolocation error:', error);
                alert('Unable to retrieve your location. Error: ' + error.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

async function fetchWeather(city) {
    try {
        const response = await fetch(`${apiUrl}weather?q=${city}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        
        if (data.cod === 200) {
            updateWeatherUI(data);
            await fetch5DayForecast(data.coord.lat, data.coord.lon);
        } else {
            throw new Error(data.message || 'Failed to fetch weather data');
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('Error fetching weather data: ' + error.message);
    }
}

async function fetchWeatherByCoords(lat, lon) {
    try {
        const response = await fetch(`${apiUrl}weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        
        if (data.cod === 200) {
            updateWeatherUI(data);
            await fetch5DayForecast(lat, lon);
        } else {
            throw new Error(data.message || 'Failed to fetch weather data');
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('Error fetching weather data: ' + error.message);
    }
}

function updateWeatherUI(data) {
    const weatherIcon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    const currentDate = new Date().toLocaleDateString();
    
    const weatherHtml = `
        <div class="weather-info">
            <h2>${data.name} (${currentDate})</h2>
            <img src="${weatherIcon}" alt="${data.weather[0].description}" class="weather-icon">
            <p>Temperature: ${Math.round(data.main.temp)}°C</p>
            <p>Feels Like: ${Math.round(data.main.feels_like)}°C</p>
            <p>Wind: ${Math.round(data.wind.speed * 3.6)} km/h</p>
            <p>Humidity: ${data.main.humidity}%</p>
            <p>Weather: ${data.weather[0].description}</p>
        </div>
    `;
    document.getElementById('weatherResult').innerHTML = weatherHtml;
}

async function fetch5DayForecast(lat, lon) {
    try {
        const response = await fetch(`${apiUrl}forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        if (data.cod === '200') {
            updateForecastUI(data);
        } else {
            throw new Error(data.message || 'Failed to fetch forecast data');
        }
    } catch (error) {
        console.error('Error fetching 5-day forecast data:', error);
        alert('Error fetching 5-day forecast data: ' + error.message);
    }
}

function updateForecastUI(data) {
    const forecastContainer = document.getElementById('forecastContainer');
    forecastContainer.innerHTML = '';
    
    // Get unique dates and their first forecast
    const dailyForecasts = data.list.reduce((acc, curr) => {
        const date = curr.dt_txt.split(' ')[0];
        if (!acc[date] && acc.size < 5) {
            acc.set(date, curr);
        }
        return acc;
    }, new Map());

    dailyForecasts.forEach((day) => {
        const date = new Date(day.dt_txt).toLocaleDateString();
        const forecastHtml = `
            <div class="forecast-item">
                <h3>${date}</h3>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" 
                     alt="${day.weather[0].description}" 
                     class="forecast-icon">
                <p>Temp: ${Math.round(day.main.temp)}°C</p>
                <p>Wind: ${Math.round(day.wind.speed * 3.6)} km/h</p>
                <p>Humidity: ${day.main.humidity}%</p>
                <p>${day.weather[0].description}</p>
            </div>
        `;
        forecastContainer.innerHTML += forecastHtml;
    });
}
