// Sample data
const trips = [
  { title: "Goa Beach Stay", location: "Goa", price: 3500, rating: 4.5, season: "Summer", image: "https://picsum.photos/400/200?1" },
  { title: "Shimla Hills", location: "Shimla", price: 2500, rating: 4.3, season: "Winter", image: "https://picsum.photos/400/200?2" },
  { title: "Kerala Backwaters", location: "Alleppey", price: 4500, rating: 4.8, season: "Monsoon", image: "https://picsum.photos/400/200?3" },
  { title: "Desert Safari", location: "Jaisalmer", price: 3000, rating: 4.0, season: "Winter", image: "https://picsum.photos/400/200?4" },
  { title: "Darjeeling Tea Trip", location: "Darjeeling", price: 2800, rating: 4.6, season: "Spring", image: "https://picsum.photos/400/200?5" }
];

const resultsContainer = document.getElementById("results");
const countText = document.getElementById("countText");
const seasonChips = document.getElementById("seasonChips");
const emptyState = document.getElementById("empty");

const qInput = document.getElementById("q");
const locationInput = document.getElementById("location");
const minPriceInput = document.getElementById("minPrice");
const maxPriceInput = document.getElementById("maxPrice");
const minRatingInput = document.getElementById("minRating");
const sortSelect = document.getElementById("sortSelect");

const seasons = ["Summer", "Winter", "Monsoon", "Spring"];
let selectedSeasons = [];

function renderSeasonChips() {
  seasonChips.innerHTML = "";
  seasons.forEach(season => {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.textContent = season;
    chip.addEventListener("click", () => {
      chip.classList.toggle("selected");
      if (selectedSeasons.includes(season)) {
        selectedSeasons = selectedSeasons.filter(s => s !== season);
      } else {
        selectedSeasons.push(season);
      }
      applyFilters();
    });
    seasonChips.appendChild(chip);
  });
}

function renderTrips(filteredTrips) {
  resultsContainer.innerHTML = "";
  if (filteredTrips.length === 0) {
    emptyState.style.display = "block";
    countText.textContent = "0 results";
    return;
  }
  emptyState.style.display = "none";
  countText.textContent = `${filteredTrips.length} result${filteredTrips.length > 1 ? "s" : ""}`;
  filteredTrips.forEach(trip => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${trip.image}" alt="${trip.title}">
      <div class="card-body">
        <h3>${trip.title}</h3>
        <p>${trip.location} · ₹${trip.price} · ⭐${trip.rating}</p>
        <p><strong>Season:</strong> ${trip.season}</p>
      </div>
    `;
    resultsContainer.appendChild(card);
  });
}

function applyFilters() {
  let filtered = trips.filter(trip => {
    const matchesQuery = trip.title.toLowerCase().includes(qInput.value.toLowerCase());
    const matchesLocation = trip.location.toLowerCase().includes(locationInput.value.toLowerCase());
    const matchesPrice = trip.price >= Number(minPriceInput.value) && trip.price <= Number(maxPriceInput.value);
    const matchesRating = trip.rating >= Number(minRatingInput.value);
    const matchesSeason = selectedSeasons.length === 0 || selectedSeasons.includes(trip.season);
    return matchesQuery && matchesLocation && matchesPrice && matchesRating && matchesSeason;
  });

  // Sorting
  if (sortSelect.value === "price_asc") filtered.sort((a, b) => a.price - b.price);
  if (sortSelect.value === "price_desc") filtered.sort((a, b) => b.price - a.price);
  if (sortSelect.value === "rating") filtered.sort((a, b) => b.rating - a.rating);

  renderTrips(filtered);
}

document.getElementById("applyBtn").addEventListener("click", applyFilters);
document.getElementById("clearBtn").addEventListener("click", () => {
  qInput.value = "";
  locationInput.value = "";
  minPriceInput.value = 0;
  maxPriceInput.value = 10000;
  minRatingInput.value = 0;
  selectedSeasons = [];
  renderSeasonChips(); // reset chips selection
  applyFilters();
});

sortSelect.addEventListener("change", applyFilters);

renderSeasonChips();
applyFilters(); // initial render
