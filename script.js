/**
 * WeatherFlow — Mock weather data & UI controller
 * Locations: Mumbai, Delhi (India), London, Paris
 */

const WEATHER_DATA = {
  mumbai: {
    city: "Mumbai",
    region: "Maharashtra, India",
    condition: "rain",
    conditionText: "Heavy Rain",
    tempC: 29,
    feelsLikeC: 33,
    humidity: 82,
    windKph: 18,
    pressure: 1008,
    visibilityKm: 6,
  },
  delhi: {
    city: "Delhi",
    region: "Delhi, India",
    condition: "thunder",
    conditionText: "Thunderstorms",
    tempC: 36,
    feelsLikeC: 41,
    humidity: 55,
    windKph: 22,
    pressure: 1002,
    visibilityKm: 8,
  },
  london: {
    city: "London",
    region: "England, United Kingdom",
    condition: "snow",
    conditionText: "Light Snow",
    tempC: 2,
    feelsLikeC: -1,
    humidity: 78,
    windKph: 24,
    pressure: 1015,
    visibilityKm: 5,
  },
  paris: {
    city: "Paris",
    region: "Île-de-France, France",
    condition: "clear",
    conditionText: "Sunny",
    tempC: 22,
    feelsLikeC: 21,
    humidity: 48,
    windKph: 12,
    pressure: 1020,
    visibilityKm: 15,
  },
};

const VALID_CITIES = Object.keys(WEATHER_DATA);
const THEME_MAP = {
  clear: "clear",
  rain: "rain",
  snow: "snow",
  thunder: "thunder",
  cloudy: "cloudy",
};

let currentUnit = "celsius";
let currentCityKey = "mumbai";

const els = {
  body: document.body,
  searchForm: document.getElementById("searchForm"),
  citySearch: document.getElementById("citySearch"),
  errorBanner: document.getElementById("errorBanner"),
  errorMessage: document.getElementById("errorMessage"),
  errorDismiss: document.getElementById("errorDismiss"),
  weatherCard: document.getElementById("weatherCard"),
  cardLoading: document.getElementById("cardLoading"),
  cardContent: document.getElementById("cardContent"),
  iconStage: document.getElementById("iconStage"),
  cityName: document.getElementById("cityName"),
  region: document.getElementById("region"),
  temperature: document.getElementById("temperature"),
  feelsLike: document.getElementById("feelsLike"),
  conditionText: document.getElementById("conditionText"),
  humidity: document.getElementById("humidity"),
  wind: document.getElementById("wind"),
  pressure: document.getElementById("pressure"),
  visibility: document.getElementById("visibility"),
  lastUpdated: document.getElementById("lastUpdated"),
  cityChips: document.getElementById("cityChips"),
};

function normalizeCity(input) {
  return input.trim().toLowerCase().replace(/\s+/g, "");
}

function resolveCityKey(query) {
  const key = normalizeCity(query);
  if (WEATHER_DATA[key]) return key;

  const alias = Object.keys(WEATHER_DATA).find(
    (k) => WEATHER_DATA[k].city.toLowerCase() === key
  );
  return alias || null;
}

function cToF(c) {
  return Math.round((c * 9) / 5 + 32);
}

function formatTemp(celsius) {
  if (currentUnit === "fahrenheit") {
    return `${cToF(celsius)}°F`;
  }
  return `${celsius}°C`;
}

function showError(message) {
  els.errorMessage.textContent = message;
  els.errorBanner.classList.remove("hidden");
}

function hideError() {
  els.errorBanner.classList.add("hidden");
}

function setActiveChip(cityKey) {
  els.cityChips.querySelectorAll(".chip").forEach((chip) => {
    const key = normalizeCity(chip.dataset.city);
    chip.classList.toggle("active", key === cityKey);
  });
}

function buildSunIcon() {
  const rays = Array.from({ length: 8 }, (_, i) => {
    const deg = i * 45;
    return `<span class="ray" style="transform: rotate(${deg}deg)"></span>`;
  }).join("");
  return `<div class="weather-icon icon-sun"><div class="sun-core"></div>${rays}</div>`;
}

function buildRainIcon() {
  const drops = Array.from({ length: 4 }, () => '<span class="drop"></span>').join("");
  return `<div class="weather-icon icon-rain"><div class="cloud"></div>${drops}</div>`;
}

function buildSnowIcon() {
  const flakes = Array.from({ length: 4 }, () => '<span class="flake"></span>').join("");
  return `<div class="weather-icon icon-snow"><div class="cloud"></div>${flakes}</div>`;
}

function buildThunderIcon() {
  return `<div class="weather-icon icon-thunder"><div class="cloud"></div><span class="bolt"></span></div>`;
}

function buildCloudyIcon() {
  return `<div class="weather-icon icon-rain" style="--no-rain:1"><div class="cloud"></div></div>`;
}

function renderWeatherIcon(condition) {
  switch (condition) {
    case "clear":
      return buildSunIcon();
    case "rain":
      return buildRainIcon();
    case "snow":
      return buildSnowIcon();
    case "thunder":
      return buildThunderIcon();
    case "cloudy":
      return buildCloudyIcon();
    default:
      return buildSunIcon();
  }
}

function applyTheme(condition) {
  const theme = THEME_MAP[condition] || "clear";
  els.body.setAttribute("data-theme", theme);
  els.iconStage.setAttribute("data-weather", condition);
}

function updateUI(data) {
  const unit = currentUnit === "fahrenheit" ? "°F" : "°C";
  const temp = currentUnit === "fahrenheit" ? cToF(data.tempC) : data.tempC;

  els.cityName.textContent = data.city;
  els.region.textContent = data.region;
  els.temperature.innerHTML = `${temp}<span class="temp-unit">${unit}</span>`;
  els.feelsLike.textContent = formatTemp(data.feelsLikeC);
  els.conditionText.textContent = data.conditionText;
  els.humidity.textContent = `${data.humidity}%`;
  els.wind.textContent = `${data.windKph} km/h`;
  els.pressure.textContent = `${data.pressure} hPa`;
  els.visibility.textContent = `${data.visibilityKm} km`;
  els.lastUpdated.textContent = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  els.iconStage.innerHTML = renderWeatherIcon(data.condition);
  applyTheme(data.condition);
}

function simulateFetch(cityKey) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const data = WEATHER_DATA[cityKey];
      if (data) resolve(data);
      else reject(new Error("No data"));
    }, 600);
  });
}

async function loadWeather(cityInput) {
  hideError();
  const cityKey = typeof cityInput === "string" ? resolveCityKey(cityInput) : cityInput;

  if (!cityKey) {
    showError(
      `City not found. Try: ${VALID_CITIES.map((k) => WEATHER_DATA[k].city).join(", ")}.`
    );
    return;
  }

  currentCityKey = cityKey;
  setActiveChip(cityKey);
  els.citySearch.value = WEATHER_DATA[cityKey].city;

  els.cardLoading.classList.remove("hidden");
  els.cardContent.classList.add("hidden");
  els.weatherCard.classList.add("updating");

  try {
    const data = await simulateFetch(cityKey);
    updateUI(data);
    els.cardContent.classList.remove("hidden");
  } catch {
    showError("Unable to load weather data. Please try again.");
  } finally {
    els.cardLoading.classList.add("hidden");
    els.weatherCard.classList.remove("updating");
  }
}

function initUnitToggle() {
  document.querySelectorAll(".unit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const unit = btn.dataset.unit;
      if (unit === currentUnit) return;

      currentUnit = unit;
      document.querySelectorAll(".unit-btn").forEach((b) => {
        const active = b.dataset.unit === unit;
        b.classList.toggle("active", active);
        b.setAttribute("aria-pressed", active);
      });

      updateUI(WEATHER_DATA[currentCityKey]);
    });
  });
}

function initSearch() {
  els.searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = els.citySearch.value;
    if (!query.trim()) {
      showError("Please enter a city name.");
      return;
    }
    loadWeather(query);
  });
}

function initChips() {
  els.cityChips.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    loadWeather(chip.dataset.city);
  });
}

function initErrorDismiss() {
  els.errorDismiss.addEventListener("click", hideError);
}

function init() {
  initUnitToggle();
  initSearch();
  initChips();
  initErrorDismiss();
  loadWeather("mumbai");
}

document.addEventListener("DOMContentLoaded", init);
