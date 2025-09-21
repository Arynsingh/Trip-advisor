document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('trip-planner-form');
    const resultsContainer = document.getElementById('results-container');
    const spotsList = document.getElementById('spots-list');
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // Toggle dark mode
    darkModeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode');
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const preference = document.getElementById('preference').value;
        const budget = parseFloat(document.getElementById('budget').value);
        const people = parseInt(document.getElementById('people').value);

        if (!preference || isNaN(budget) || isNaN(people) || budget <= 0 || people <= 0) {
            alert('Please fill out all fields with valid numbers.');
            return;
        }

        const suggestedSpots = getSuggestedSpots(preference, budget, people);
        
        displaySpots(suggestedSpots);
    });

    function getSuggestedSpots(preference, budget, people) {
        // This is a dummy function with hardcoded data.
        const allSpots = {
            adventure: [
                { name: "Rishikesh, India", description: "River rafting, trekking, and yoga.", img: "https://placehold.co/250x150/ff9800/fff?text=Rishikesh", budgetRange: [100, 300] },
                { name: "Interlaken, Switzerland", description: "Paragliding and hiking in the Alps.", img: "https://placehold.co/250x150/4caf50/fff?text=Interlaken", budgetRange: [500, 1000] },
                { name: "Queenstown, New Zealand", description: "Bungee jumping and jet boating.", img: "https://placehold.co/250x150/2196f3/fff?text=Queenstown", budgetRange: [700, 1500] }
            ],
            cultural_heritage: [
                { name: "Jaipur, India", description: "Explore historic forts and palaces.", img: "https://placehold.co/250x150/9c27b0/fff?text=Jaipur", budgetRange: [150, 400] },
                { name: "Rome, Italy", description: "Ancient ruins like the Colosseum and Roman Forum.", img: "https://placehold.co/250x150/e91e63/fff?text=Rome", budgetRange: [400, 800] },
                { name: "Kyoto, Japan", description: "Temples, shrines, and geisha districts.", img: "https://placehold.co/250x150/673ab7/fff?text=Kyoto", budgetRange: [600, 1200] }
            ],
            beaches: [
                { name: "Goa, India", description: "Vibrant nightlife and beautiful beaches.", img: "https://placehold.co/250x150/ffeb3b/000?text=Goa", budgetRange: [100, 350] },
                { name: "Phuket, Thailand", description: "Stunning islands and water sports.", img: "https://placehold.co/250x150/00bcd4/fff?text=Phuket", budgetRange: [300, 700] },
                { name: "Maldives", description: "Luxury resorts and clear blue waters.", img: "https://placehold.co/250x150/03a9f4/fff?text=Maldives", budgetRange: [1000, 5000] }
            ],
            mountains: [
                { name: "Manali, India", description: "Snow-capped peaks and trekking routes.", img: "https://placehold.co/250x150/795548/fff?text=Manali", budgetRange: [120, 300] },
                { name: "Banff National Park, Canada", description: "Turquoise lakes and mountain trails.", img: "https://placehold.co/250x150/607d8b/fff?text=Banff", budgetRange: [600, 1100] },
                { name: "Swiss Alps, Switzerland", description: "Scenic views and skiing.", img: "https://placehold.co/250x150/9e9e9e/fff?text=Swiss+Alps", budgetRange: [700, 1500] }
            ],
            festival: [
                { name: "Rio de Janeiro, Brazil", description: "Known for the famous Carnival festival.", img: "https://placehold.co/250x150/ff5722/fff?text=Rio+Carnival", budgetRange: [400, 900] },
                { name: "Munich, Germany", description: "Home of the world-renowned Oktoberfest.", img: "https://placehold.co/250x150/f44336/fff?text=Oktoberfest", budgetRange: [500, 1000] },
                { name: "Nagaland, India", description: "Experience the colorful Hornbill Festival.", img: "https://placehold.co/250x150/ffc107/000?text=Hornbill", budgetRange: [200, 500] }
            ],
            wildlife: [
                { name: "Ranthambore, India", description: "Tiger safari in a historic park.", img: "https://placehold.co/250x150/8bc34a/fff?text=Ranthambore", budgetRange: [250, 600] },
                { name: "Maasai Mara, Kenya", description: "Witness the Great Migration.", img: "https://placehold.co/250x150/009688/fff?text=Maasai+Mara", budgetRange: [1500, 3000] }
            ],
            food: [
                { name: "Kolkata, India", description: "A paradise for street food lovers.", img: "https://placehold.co/250x150/ff9800/fff?text=Kolkata+Food", budgetRange: [100, 200] },
                { name: "Tokyo, Japan", description: "Michelin-star restaurants and unique culinary experiences.", img: "https://placehold.co/250x150/9e9e9e/fff?text=Tokyo+Food", budgetRange: [800, 1800] }
            ],
            city_life: [
                { name: "Dubai, UAE", description: "Modern architecture, luxury shopping, and vibrant nightlife.", img: "https://placehold.co/250x150/795548/fff?text=Dubai", budgetRange: [500, 1000] },
                { name: "New York, USA", description: "Iconic landmarks and diverse cultural scene.", img: "https://placehold.co/250x150/607d8b/fff?text=New+York", budgetRange: [700, 1500] }
            ]
        };

        const totalBudget = budget * people;

        const filteredSpots = (allSpots[preference] || []).filter(spot => {
            return totalBudget >= spot.budgetRange[0] && totalBudget <= spot.budgetRange[1];
        });

        // If no spots match the budget, return all spots for that preference as a fallback
        return filteredSpots.length > 0 ? filteredSpots : (allSpots[preference] || []);
    }

    function displaySpots(spots) {
        spotsList.innerHTML = ''; // Clear previous results
        if (spots.length === 0) {
            spotsList.innerHTML = '<p style="text-align: center; color: #888;">No spots found for your criteria. Please adjust your budget or preference.</p>';
        } else {
            spots.forEach(spot => {
                const card = document.createElement('div');
                card.className = 'spot-card';
                card.innerHTML = `
                    <img src="${spot.img}" alt="${spot.name}">
                    <div class="spot-card-content">
                        <h3>${spot.name}</h3>
                        <p>${spot.description}</p>
                        <p class="budget-info">Budget (per person): $${spot.budgetRange[0]} - $${spot.budgetRange[1]}</p>
                    </div>
                `;
                spotsList.appendChild(card);
            });
        }
        resultsContainer.classList.remove('hidden');
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }
});
