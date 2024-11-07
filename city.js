
document.addEventListener("DOMContentLoaded", function() {
    const apiKey = '9e410940a54fee1f372b32bcdd35ba23';  // Replace with your OpenWeather API Key

    // Listen for the Enter key in the search bar
    document.getElementById("search-bar").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            const city = event.target.value.trim(); // Get the city from the input and trim whitespace
            if (city) {
                fetchWeatherData(city, apiKey);
            } else {
                alert("Please enter a city name!"); // Alert if the input is empty
            }
        }
    });
});

function showLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'block'; // Show spinner
}

function hideLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'none'; // Hide spinner
}

function fetchWeatherData(city, apiKey) {
    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    showLoadingSpinner(); // Show spinner when starting to fetch weather data

    fetch(weatherApiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found'); // Throw an error if the city is not found
            }
            return response.json();
        })
        .then(data => {
            updateWeatherWidget(data);
            fetchWeatherForecast(city, apiKey); // Call to fetch the 5-day forecast
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
            resetWeatherData(); // Reset UI on error
            alert(error.message); // Alert the user of the error
        });
}

function updateWeatherWidget(data) {
    document.getElementById("temperature").textContent = `Temperature: ${data.main.temp} °C`;
    document.getElementById("description").textContent = `Description: ${data.weather[0].description}`;
    document.getElementById("city").textContent = `City: ${data.name}`;
    document.getElementById("wind-speed").textContent = `Wind Speed: ${data.wind.speed} m/s`;
    document.getElementById("humidity").textContent = `Humidity: ${data.main.humidity}%`;
}

function fetchWeatherForecast(city, apiKey) {
    const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    fetch(forecastApiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Forecast not available'); // Throw an error if the forecast is not available
            }
            return response.json();
        })
        .then(forecastData => {
            updateForecastTable(forecastData);

            // Attach event listeners to buttons with the forecast data
            document.getElementById("filter-rain").onclick = () => filterRainyDays(forecastData);
            document.getElementById("hottest-day").onclick = () => showHottestDay(forecastData);
            document.getElementById("sort-descending").onclick = () => sortTemperaturesDescending(forecastData);
            document.getElementById("sort-ascending").onclick = () => sortTemperaturesAscending(forecastData);
        })
        .catch(error => {
            console.error("Error fetching forecast data:", error);
            resetForecastTable(); // Clear forecast table on error
            alert(error.message); // Alert the user of the error
        })
        .finally(() => {
            hideLoadingSpinner(); // Hide spinner after fetch completes
        });
}

function updateForecastTable(forecastData) {
    const tableBody = document.querySelector("#forecastTable tbody");
    tableBody.innerHTML = ''; // Clear the table before adding new data

    for (let i = 0; i < forecastData.list.length; i += 8) {
        const forecast = forecastData.list[i];
        const row = document.createElement('tr');
        
        // Add the fade-in animation class to each row
        row.classList.add("fade-in");

        row.innerHTML = `
            <td>${new Date(forecast.dt * 1000).toLocaleDateString()}</td>
            <td>${Math.round(forecast.main.temp)} °C</td>
            <td>${forecast.weather[0].description}</td>
            <td><img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].description} icon" /></td>
        `;
        
        tableBody.appendChild(row);
    }
}

function resetWeatherData() {
    document.getElementById("city").textContent = 'City: --';
    document.getElementById("temperature").textContent = 'Temperature: --';
    document.getElementById("humidity").textContent = 'Humidity: --';
    document.getElementById("wind-speed").textContent = 'Wind Speed: --';
    document.getElementById("description").textContent = 'Description: --';
}

function resetForecastTable() {
    const tableBody = document.querySelector("#forecastTable tbody");
    tableBody.innerHTML = ''; // Clear the forecast table on error
}

// Function to filter out days without rain
function filterRainyDays(forecastData) {
    const rainyDays = forecastData.list.filter(forecast =>
        forecast.weather.some(weather => weather.description.toLowerCase().includes('rain'))
    );
    updateForecastTable({ list: rainyDays });
}

// Function to show the day with the highest temperature
function showHottestDay(forecastData) {
    const hottestDay = forecastData.list.reduce((prev, current) => 
        prev.main.temp > current.main.temp ? prev : current
    );
    updateForecastTable({ list: [hottestDay] });
}

// Function to sort temperatures in descending order
function sortTemperaturesDescending(forecastData) {
    const sortedDescending = [...forecastData.list].sort((a, b) => b.main.temp - a.main.temp);
    updateForecastTable({ list: sortedDescending });
}

// Function to sort temperatures in ascending order
function sortTemperaturesAscending(forecastData) {
    const sortedAscending = [...forecastData.list].sort((a, b) => a.main.temp - b.main.temp);
    updateForecastTable({ list: sortedAscending });
}


document.addEventListener("DOMContentLoaded", function() {
    const apiKey = '9e410940a54fee1f372b32bcdd35ba23'; // Replace with your OpenWeather API Key

    // Listen for the Enter key in the search bar
    document.getElementById("search-bar").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            const city = event.target.value.trim(); // Get the city from the input and trim whitespace
            if (city) {
                fetchWeatherData(city, apiKey);
            } else {
                alert("Please enter a city name!"); // Alert if the input is empty
            }
        }
    });

    // My Location button functionality
    document.getElementById("my-location").addEventListener("click", function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                fetchWeatherByLocation(latitude, longitude, apiKey);
            }, error => {
                alert("Unable to retrieve your location. Please ensure location services are enabled.");
                console.error("Geolocation error:", error);
            });
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    });
});

// Fetch weather data based on coordinates
function fetchWeatherByLocation(latitude, longitude, apiKey) {
    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
    const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

    showLoadingSpinner(); // Show loading spinner while fetching data

    // Fetch current weather data
    fetch(weatherApiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Location-based weather data not found');
            }
            return response.json();
        })
        .then(data => {
            updateWeatherWidget(data); // Update current weather widget

            // Fetch 5-day forecast data after current weather data loads
            return fetch(forecastApiUrl);
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Location-based forecast data not available');
            }
            return response.json();
        })
        .then(forecastData => {
            updateForecastTable(forecastData); // Update the 5-day forecast table

            // Reattach button event listeners for the forecast controls
            document.getElementById("filter-rain").onclick = () => filterRainyDays(forecastData);
            document.getElementById("hottest-day").onclick = () => showHottestDay(forecastData);
            document.getElementById("sort-descending").onclick = () => sortTemperaturesDescending(forecastData);
            document.getElementById("sort-ascending").onclick = () => sortTemperaturesAscending(forecastData);
        })
        .catch(error => {
            console.error("Error fetching location-based weather data:", error);
            resetWeatherData();
            resetForecastTable();
            alert(error.message);
        })
        .finally(() => {
            hideLoadingSpinner(); // Hide loading spinner after data loads
        });
}
