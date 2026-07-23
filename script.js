const API_KEY = "5a0207758a7e44f5a8b135234262107";
const CURRENT_URL = "https://api.weatherapi.com/v1/current.json";
const SEARCH_URL = "https://api.weatherapi.com/v1/search.json";

const MAX_HISTORY = 5;
const DEBOUNCE_DELAY = 500;

const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const suggestionsList = document.getElementById("suggestionsList");
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
let lastWeatherData = null;
let weatherAbortController = null;
let suggestAbortController = null;

// generic debounce helper, delays calling fn until user stops typing
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();

  if (!city) {
    showError("Please enter a city name.");
    return;
  }

  hideSuggestions();
  getWeather(city);
});

cityInput.addEventListener("input", debounce(() => {
  const query = cityInput.value.trim();

  if (query.length < 2) {
    hideSuggestions();
    return;
  }

  fetchSuggestions(query);
}, DEBOUNCE_DELAY));

// hide suggestions when clicking outside the search box
document.addEventListener("click", (e) => {
  if (!searchForm.contains(e.target)) {
    hideSuggestions();
  }
});

async function fetchSuggestions(query) {
  if (suggestAbortController) {
    suggestAbortController.abort();
  }
  suggestAbortController = new AbortController();

  try {
    const res = await fetch(
      `${SEARCH_URL}?key=${API_KEY}&q=${encodeURIComponent(query)}`,
      { signal: suggestAbortController.signal }
    );

    if (!res.ok) {
      hideSuggestions();
      return;
    }

    const data = await res.json();
    renderSuggestions(data);
  } catch (err) {
    // ignore aborted requests, they just mean a newer keystroke came in
    if (err.name !== "AbortError") {
      hideSuggestions();
    }
  }
}

function renderSuggestions(places) {
  suggestionsList.innerHTML = "";

  if (!places || places.length === 0) {
    hideSuggestions();
    return;
  }

  places.slice(0, 6).forEach((place) => {
    const li = document.createElement("li");
    li.textContent = `${place.name}, ${place.country}`;
    li.addEventListener("click", () => {
      cityInput.value = place.name;
      hideSuggestions();
      getWeather(place.name);
    });
    suggestionsList.appendChild(li);
  });

  suggestionsList.classList.remove("hidden");
}

function hideSuggestions() {
  suggestionsList.classList.add("hidden");
  suggestionsList.innerHTML = "";
}

async function getWeather(city) {
  if (weatherAbortController) {
    weatherAbortController.abort();
  }
  weatherAbortController = new AbortController();

  showLoader();

  try {
    const res = await fetch(
      `${CURRENT_URL}?key=${API_KEY}&q=${encodeURIComponent(city)}`,
      { signal: weatherAbortController.signal }
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
    if (err.name !== "AbortError") {
      showError(err.message);
    }
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

// theme is dark by default now, toggle switches to light and back
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
  const isLight = document.body.classList.contains("light");
  themeToggle.textContent = isLight ? "🌙" : "☀️";
  localStorage.setItem("theme", isLight ? "light" : "dark");
});

unitToggle.addEventListener("click", () => {
  currentUnit = currentUnit === "C" ? "F" : "C";
  unitToggle.textContent = currentUnit === "C" ? "°F" : "°C";
  localStorage.setItem("unit", currentUnit);

  if (lastWeatherData) {
    renderWeather(lastWeatherData);
  }
});

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem("searchHistory")) || [];
  } catch (err) {
    return [];
  }
}

function saveToHistory(city) {
  let history = getHistory();

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

window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light");
    themeToggle.textContent = "🌙";
  }

  unitToggle.textContent = currentUnit === "C" ? "°F" : "°C";

  renderHistory();

  const lastCity = localStorage.getItem("lastCity");
  if (lastCity) {
    cityInput.value = lastCity;
    getWeather(lastCity);
  }
});