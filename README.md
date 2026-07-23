🌤️ Weather Dashboard

A weather app built as part of my web development internship track. Started as a basic city-search weather app and has been improved incrementally over multiple days — added local storage persistence, search-as-you-type with debouncing, and a full redesign of the UI.

Live on GitHub — link shared in the repo description / submission channel.

Features
Live weather data for any city, pulled from WeatherAPI
Search-as-you-type with debounced input (no request spam on every keystroke)
Autocomplete suggestions while typing, using a separate search endpoint
State persistence via localStorage:
Last searched city auto-loads on page open
5 most recent searches saved, clickable to reload
Preferred temperature unit (°C / °F) remembered
Theme preference (dark / light) remembered
Loading and error states handled gracefully — no crashes on invalid city names
Dark theme by default, with a toggle to switch to light
Fully responsive layout, works down to mobile widths
Clear History button to wipe saved searches
Tech Stack
HTML5
CSS3 (Grid + Flexbox, custom properties for theming, no frameworks)
Vanilla JavaScript (Fetch API, async/await, debounce, AbortController)
Fonts: Space Grotesk, Inter, JetBrains Mono (Google Fonts)
WeatherAPI — current.json and search.json endpoints
Project Structure
weather-dashboard/
├── index.html
├── style.css
├── script.js
└── README.md
How It Works
Typing a city (2+ characters) triggers a debounced call to the search endpoint and shows a dropdown of matching cities.
Selecting a suggestion (or hitting Search) fetches the full current weather and renders it.
Every successful search is saved to localStorage (deduped, capped at 5) and shown as clickable chips.
On page load, the last searched city is auto-fetched, and saved theme/unit preferences are re-applied.
AbortController is used on both the suggestion and weather fetches so a slow, older request can't overwrite a newer one if you type fast.
Running Locally
Clone the repo
bash
   git clone <repo-url>
   cd weather-dashboard
Open index.html directly in a browser, or use a Live Server extension for auto-reload.
No build step, no dependencies to install — it's plain HTML/CSS/JS.

Note: the API key in script.js is a free-tier WeatherAPI key used for development/demo purposes.

What I Learned
Handling async race conditions when requests can resolve out of order (search-as-you-type is a great example of why this matters)
Debouncing user input to avoid overwhelming an API
Persisting and rehydrating app state with localStorage + JSON.stringify / JSON.parse
Iterating on an existing codebase instead of rewriting from scratch each time
Rebuilding a UI's visual direction without touching working logic
Possible Next Steps
Add geolocation-based weather on first load (with permission)
Add a 5-day forecast view
Add unit tests for the debounce/history helper functions

Made by Rayyan Bashir