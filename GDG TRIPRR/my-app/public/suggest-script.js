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
        const spots = {
            adventure: [
                { name: "Rishikesh, India", description: "River rafting, trekking, and yoga.", img: "https://via.placeholder.com/250x150.png?text=Rishikesh" },
                { name: "Interlaken, Switzerland", description: "Paragliding and hiking in the Alps.", img: "https://via.placeholder.com/250x150.png?text=Interlaken" },
                { name: "Queenstown, New Zealand", description: "Bungee jumping and jet boating.", img: "https://via.placeholder.com/250x150.png?text=Queenstown" }
            ],
            cultural_heritage: [
                { name: "Rome, Italy", description: "Ancient ruins like the Colosseum and Roman Forum.", img: "https://via.placeholder.com/250x150.png?text=Rome" },
                { name: "Kyoto, Japan", description: "Temples, shrines, and geisha districts.", img: "https://via.placeholder.com/250x150.png?text=Kyoto" },
                { name: "Jaipur, India", description: "Historic forts and palaces of Rajasthan.", img: "https://via.placeholder.com/250x150.png?text=Jaipur" }
            ],
            beaches: [
                { name: "Maldives", description: "Luxury resorts and clear blue waters.", img: "https://via.placeholder.com/250x150.png?text=Maldives" },
                { name: "Goa, India", description: "Vibrant nightlife and beautiful beaches.", img: "https://via.placeholder.com/250x150.png?text=Goa" },
                { name: "Phuket, Thailand", description: "Stunning islands and water sports.", img: "https://via.placeholder.com/250x150.png?text=Phuket" }
            ],
            mountains: [
                { name: "Swiss Alps, Switzerland", description: "Scenic views and skiing.", img: "https://via.placeholder.com/250x150.png?text=Swiss+Alps" },
                { name: "Manali, India", description: "Snow-capped peaks and trekking routes.", img: "https://via.placeholder.com/250x150.png?text=Manali" },
                { name: "Banff National Park, Canada", description: "Turquoise lakes and mountain trails.", img: "https://via.placeholder.com/250x150.png?text=Banff" }
            ],
            festival: [
                { name: "Rio de Janeiro, Brazil", description: "Known for the famous Carnival festival.", img: "https://via.placeholder.com/250x150.png?text=Rio+Carnival" },
                { name: "Nagaland, India", description: "Experience the colorful Hornbill Festival.", img: "https://via.placeholder.com/250x150.png?text=Hornbill+Festival" },
                { name: "Munich, Germany", description: "Home of the world-renowned Oktoberfest.", img: "https://via.placeholder.com/250x150.png?text=Oktoberfest" }
            ],
        };

        return spots[preference] || [];
    }

    function displaySpots(spots) {
        spotsList.innerHTML = ''; // Clear previous results
        if (spots.length === 0) {
            spotsList.innerHTML = '<p style="text-align: center; color: #888;">No spots found for your criteria.</p>';
        } else {
            spots.forEach(spot => {
                const card = document.createElement('div');
                card.className = 'spot-card';
                card.innerHTML = `
                    <img src="${spot.img}" alt="${spot.name}">
                    <div class="spot-card-content">
                        <h3>${spot.name}</h3>
                        <p>${spot.description}</p>
                    </div>
                `;
                spotsList.appendChild(card);
            });
        }
        resultsContainer.classList.remove('hidden');
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }
});
