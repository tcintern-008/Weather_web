
// key from https://www.weatherapi.com/
const API_KEY = "5a0207758a7e44f5a8b135234262107";
const BASE_URL = "https://api.weatherapi.com/v1/current.json";
 
const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const loader = document.getElementById("loader");
const errorBox = document.getElementById("errorBox");
const errorText = document.getElementById("errorText");
const weatherCard = document.getElementById("weatherCard");
const themeToggle = document.getElementById("themeToggle");
 
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
 
    renderWeather(data);
    localStorage.setItem("lastCity", city);
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
  document.getElementById("temperature").textContent = `${Math.round(current.temp_c)}°C`;
  document.getElementById("description").textContent = current.condition.text;
  document.getElementById("humidity").textContent = `${current.humidity}%`;
  document.getElementById("wind").textContent = `${current.wind_kph} km/h`;
  document.getElementById("feelsLike").textContent = `${Math.round(current.feelslike_c)}°C`;
 
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
 
// load saved theme + last searched city on page load
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️";
  }
 
  const lastCity = localStorage.getItem("lastCity");
  if (lastCity) {
    cityInput.value = lastCity;
    getWeather(lastCity);
  }
});