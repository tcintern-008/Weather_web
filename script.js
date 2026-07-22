const API_KEY = "5a0207758a7e44f5a8b135234262107";
const BASE_URL = "https://api.weatherapi.com/v1/current.json";

const MAX_HISTORY = 5;

const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const loader = document.getElementById("loader");
const errorBox = document.getElementById("errorBox");
const errorText = document.getElementById("errorText");
const weatherCard = document.getElementById("weatherCard");
const themeToggle = document.getElementById("themeToggle");
const unitToggle = document.getElementById("unitToggle");
const historySection = document.getElementById("historySection");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistory");

let currentUnit = localStorage.getItem("unit") || "C";
let lastWeatherData = null; // used so unit toggle can re-render without re-fetching

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();

  if (!city) {
    showError("Please enter a city name.");
    return;
  }

  getWeather(city);
});

async function getWeather(city) {
  showLoader();

  try {
    const res = await fetch(
      `${BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(city)}`
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || "City not found. Check the spelling and try again.");
    }

    lastWeatherData = data;
    renderWeather(data);
    localStorage.setItem("lastCity", city);
    saveToHistory(data.location.name);
  } catch (err) {
    showError(err.message);
  } finally {
    hideLoader();
  }
}

function renderWeather(data) {
  const location = data.location;
  const current = data.current;

  document.getElementById("cityName").textContent = `${location.name}, ${location.country}`;
  document.getElementById("dateTime").textContent = location.localtime;
  document.getElementById("description").textContent = current.condition.text;
  document.getElementById("humidity").textContent = `${current.humidity}%`;
  document.getElementById("wind").textContent = `${current.wind_kph} km/h`;

  // show temp in whichever unit is currently selected
  if (currentUnit === "F") {
    document.getElementById("temperature").textContent = `${Math.round(current.temp_f)}°F`;
    document.getElementById("feelsLike").textContent = `${Math.round(current.feelslike_f)}°F`;
  } else {
    document.getElementById("temperature").textContent = `${Math.round(current.temp_c)}°C`;
    document.getElementById("feelsLike").textContent = `${Math.round(current.feelslike_c)}°C`;
  }

  document.getElementById("weatherIcon").src = `https:${current.condition.icon}`;

  errorBox.classList.add("hidden");
  weatherCard.classList.remove("hidden");
}

function showLoader() {
  loader.classList.remove("hidden");
  weatherCard.classList.add("hidden");
  errorBox.classList.add("hidden");
}

function hideLoader() {
  loader.classList.add("hidden");
}

function showError(message) {
  errorText.textContent = message;
  errorBox.classList.remove("hidden");
  weatherCard.classList.add("hidden");
}

// dark / light mode toggle
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  themeToggle.textContent = isDark ? "☀️" : "🌙";
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// °C / °F toggle
unitToggle.addEventListener("click", () => {
  currentUnit = currentUnit === "C" ? "F" : "C";
  unitToggle.textContent = currentUnit === "C" ? "°F" : "°C";
  localStorage.setItem("unit", currentUnit);

  if (lastWeatherData) {
    renderWeather(lastWeatherData);
  }
});

// ---- recent searches ----

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem("searchHistory")) || [];
  } catch (err) {
    return [];
  }
}

function saveToHistory(city) {
  let history = getHistory();

  // avoid duplicates, keep most recent search first
  history = history.filter((c) => c.toLowerCase() !== city.toLowerCase());
  history.unshift(city);

  if (history.length > MAX_HISTORY) {
    history = history.slice(0, MAX_HISTORY);
  }

  localStorage.setItem("searchHistory", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const history = getHistory();
  historyList.innerHTML = "";

  if (history.length === 0) {
    historySection.classList.add("hidden");
    return;
  }

  historySection.classList.remove("hidden");

  history.forEach((city) => {
    const li = document.createElement("li");
    li.textContent = city;
    li.addEventListener("click", () => {
      cityInput.value = city;
      getWeather(city);
    });
    historyList.appendChild(li);
  });
}

clearHistoryBtn.addEventListener("click", () => {
  localStorage.removeItem("searchHistory");
  renderHistory();
});

// load saved theme, unit, history and last searched city on page load
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️";
  }

  unitToggle.textContent = currentUnit === "C" ? "°F" : "°C";

  renderHistory();

  const lastCity = localStorage.getItem("lastCity");
  if (lastCity) {
    cityInput.value = lastCity;
    getWeather(lastCity);
  }
});