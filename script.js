// Replace with your own key from https://api.nasa.gov/ for higher rate limits.
// DEMO_KEY works out of the box but is limited to ~30 requests/hour.
const API_KEY = "gFKL4ooMOlgJTbLZiRUBFUvHs1qhQibWvjX1ucGc"; //This is my API key obtained by signing up. And don't copy or reuse this
const BASE_URL = "https://api.nasa.gov/planetary/apod";

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const currentImageContainer = document.getElementById("current-image-container");
const searchHistoryList = document.getElementById("search-history");

// Render fetched APOD data into the container (XSS-safe: no innerHTML with raw data)
function renderApod(data) {
  currentImageContainer.textContent = ""; // clear previous content safely

  const title = document.createElement("h2");
  title.textContent = data.title;

  const dateEl = document.createElement("p");
  dateEl.className = "date";
  dateEl.textContent = data.date;

  let mediaEl;
  if (data.media_type === "video") {
    mediaEl = document.createElement("iframe");
    mediaEl.src = data.url;
    mediaEl.width = "100%";
    mediaEl.height = "400";
    mediaEl.setAttribute("frameborder", "0");
    mediaEl.setAttribute("allowfullscreen", "");
  } else {
    mediaEl = document.createElement("img");
    mediaEl.src = data.url;
    mediaEl.alt = data.title;
  }

  const explanation = document.createElement("p");
  explanation.className = "explanation";
  explanation.textContent = data.explanation;

  currentImageContainer.append(mediaEl, title, dateEl, explanation);
}

function renderLoading() {
  currentImageContainer.textContent = "";
  const spinner = document.createElement("div");
  spinner.className = "spinner";
  const p = document.createElement("p");
  p.className = "placeholder";
  p.textContent = "Loading picture...";
  currentImageContainer.append(spinner, p);
}

function renderError(message) {
  currentImageContainer.textContent = "";
  const p = document.createElement("p");
  p.className = "error";
  p.textContent = message;
  currentImageContainer.appendChild(p);
}

// Fetches and displays today's picture on page load
async function getCurrentImageOfTheDay() {
  const currentDate = new Date().toISOString().split("T")[0];
  renderLoading();
  try {
    const response = await fetch(`${BASE_URL}?date=${currentDate}&api_key=${API_KEY}`);
    if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
    const data = await response.json();
    renderApod(data);
  } catch (err) {
    renderError(`Could not load today's picture: ${err.message}`);
  }
}

// Fetches picture for a user-selected date, saves it, and updates history
async function getImageOfTheDay(date) {
  renderLoading();
  try {
    const response = await fetch(`${BASE_URL}?date=${date}&api_key=${API_KEY}`);
    if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
    const data = await response.json();
    renderApod(data);
    saveSearch(date);
    addSearchToHistory();
  } catch (err) {
    renderError(`Could not load picture for ${date}: ${err.message}`);
  }
}

// Saves a date string into the "searches" array in localStorage
function saveSearch(date) {
  const searches = JSON.parse(localStorage.getItem("searches")) || [];
  if (!searches.includes(date)) {
    searches.push(date);
    localStorage.setItem("searches", JSON.stringify(searches));
  }
}

// Reads saved searches from localStorage and renders them as clickable list items
function addSearchToHistory() {
  const searches = JSON.parse(localStorage.getItem("searches")) || [];
  searchHistoryList.textContent = ""; // clear before re-render

  searches.forEach((date) => {
    const li = document.createElement("li");
    li.textContent = date; // safe: textContent, not innerHTML
    li.addEventListener("click", () => {
      getImageOfTheDay(date);
    });
    searchHistoryList.appendChild(li);
  });
}

// Handle form submission
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const selectedDate = searchInput.value;
  if (!selectedDate) return;
  getImageOfTheDay(selectedDate);
});

// Initial load
getCurrentImageOfTheDay();
addSearchToHistory();
