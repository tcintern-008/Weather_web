# Weather App

Simple weather app built with HTML, CSS and vanilla JavaScript. Uses the OpenWeatherMap API with `fetch`, `async/await` and `try...catch` for error handling.

## Features
- Search weather by city name
- Current temperature, condition, humidity and wind speed
- Weather icon based on API response
- Loading state while fetching
- Graceful handling of invalid city names
- Last searched city saved in `localStorage`
- Dark / light mode toggle

## Setup
1. Get a free API key from https://openweathermap.org/api
2. Open `script.js` and replace `YOUR_OPENWEATHERMAP_API_KEY` with your key.
3. Open `index.html` in the browser (or use Live Server).

## Push to GitHub (PowerShell)
```powershell
git init
git add .
git commit -m "Weather app - async JS + fetch API"
git branch -M main
git remote add origin https://github.com/<your-username>/weather-app.git
git push -u origin main
```
