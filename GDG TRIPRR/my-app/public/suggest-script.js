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
                { name: "Rishikesh, India", description: "River rafting, trekking, and yoga.", img: "https://images.unsplash.com/photo-1549721096-7649520b2d69?q=80&w=1740&auto=format&fit=crop" },
                { name: "Interlaken, Switzerland", description: "Paragliding and hiking in the Alps.", img: "https://images.unsplash.com/photo-1627993358053-524f2b98e1ae?q=80&w=1674&auto=format&fit=crop" },
                { name: "Queenstown, New Zealand", description: "Bungee jumping and jet boating.", img: "https://images.unsplash.com/photo-1558273760-26284f23b754?q=80&w=1740&auto=format&fit=crop" }
            ],
            cultural_heritage: [
                { name: "Rome, Italy", description: "Ancient ruins like the Colosseum and Roman Forum.", img: "https://images.unsplash.com/photo-1552832320-c25e87a2a7a5?q=80&w=1740&auto=format&fit=crop" },
                { name: "Kyoto, Japan", description: "Temples, shrines, and geisha districts.", img: "https://images.unsplash.com/photo-1542051841316-d3c5f6e8903c?q=80&w=1740&auto=format&fit=crop" },
                { name: "Jaipur, India", description: "Historic forts and palaces of Rajasthan.", img: "https://images.unsplash.com/photo-1582239328224-e918c5e6089d?q=80&w=1740&auto=format&fit=crop" }
            ],
            beaches: [
                { name: "Maldives", description: "Luxury resorts and clear blue waters.", img: "https://images.unsplash.com/photo-1543851528-91255e141a0e?q=80&w=1740&auto=format&fit=crop" },
                { name: "Goa, India", description: "Vibrant nightlife and beautiful beaches.", img: "https://images.unsplash.com/photo-1616428753232-a52140a79d00?q=80&w=1740&auto=format&fit=crop" },
                { name: "Phuket, Thailand", description: "Stunning islands and water sports.", img: "https://images.unsplash.com/photo-1588636402447-789a8e0344d1?q=80&w=1740&auto=format&fit=crop" }
            ],
            mountains: [
                { name: "Swiss Alps, Switzerland", description: "Scenic views and skiing.", img: "https://images.unsplash.com/photo-1518090022216-9b5f7e7f1f0e?q=80&w=1740&auto=format&fit=crop" },
                { name: "Manali, India", description: "Snow-capped peaks and trekking routes.", img: "https://images.unsplash.com/photo-1621648011216-160a2b972e0a?q=80&w=1740&auto=format&fit=crop" },
                { name: "Banff National Park, Canada", description: "Turquoise lakes and mountain trails.", img: "https://images.unsplash.com/photo-1510414842594-ead47a03fe0e?q=80&w=1740&auto=format&fit=crop" }
            ],
            festival: [
                { name: "Rio de Janeiro, Brazil", description: "Known for the famous Carnival festival.", img: "https://images.unsplash.com/photo-1533038622830-1c39c894982a?q=80&w=1740&auto=format&fit=crop" },
                { name: "Nagaland, India", description: "Experience the colorful Hornbill Festival.", img: "https://images.unsplash.com/photo-1585647530869-d9f75f7936a7?q=80&w=1740&auto=format&fit=crop" },
                { name: "Munich, Germany", description: "Home of the world-renowned Oktoberfest.", img: "https://images.unsplash.com/photo-1632734199852-c6f3768f5b8c?q=80&w=1740&auto=format&fit=crop" }
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
