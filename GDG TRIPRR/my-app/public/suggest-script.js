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
                { name: "Rishikesh, India", description: "River rafting, trekking, and yoga.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Trayambakeshwar_Temple_VK.jpg/1200px-Trayambakeshwar_Temple_VK.jpg" },
                { name: "Interlaken, Switzerland", description: "Paragliding and hiking in the Alps.", img: "https://images.winalist.com/blog/wp-content/uploads/2025/06/01160435/adobestock-281148366-1500x1000.jpeg" },
                { name: "Queenstown, New Zealand", description: "Bungee jumping and jet boating.", img: "https://www.holidify.com/images/bgImages/QUEENSTOWN.jpg" }
            ],
            cultural_heritage: [
                { name: "Rome, Italy", description: "Ancient ruins like the Colosseum and Roman Forum.", img: "https://www.ytravelblog.com/wp-content/uploads/2022/08/rome-italy.jpg" },
                { name: "Kyoto, Japan", description: "Temples, shrines, and geisha districts.", img: "https://www.hertz.com/content/dam/hertz/global/blog-articles/planning-a-trip/kyoto-japan/kyoto-header.rendition.medium.jpg" },
                { name: "Jaipur, India", description: "Historic forts and palaces of Rajasthan.", img: "https://s7ap1.scene7.com/is/image/incredibleindia/amber-fort-jaipur-rajasthan-1-attr-hero?qlt=82&ts=1742157903972" }
            ],
            beaches: [
                { name: "Maldives", description: "Luxury resorts and clear blue waters.", img: "https://www.travelandleisure.com/thmb/N_r_xMvHfYjCHgZE-9bAWNiVAwU=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/TAL-conrad-maldives-rangali-island-MALDIVESHOTELS1024-6dfdeac00fec4f69893e7576b5896da9.jpg" },
                { name: "Goa, India", description: "Vibrant nightlife and beautiful beaches.", img: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/33/fc/f0/goa.jpg?w=600&h=500&s=1" },
                { name: "Phuket, Thailand", description: "Stunning islands and water sports.", img: "https://static.toiimg.com/photo/54539234.cms" }
            ],
            mountains: [
                { name: "Swiss Alps, Switzerland", description: "Scenic views and skiing.", img: "https://media.assettype.com/outlooktraveller%2Fimport%2Foutlooktraveller%2Fpublic%2Fuploads%2Farticles%2Fexplore%2FDepositphotos_66016481_S.jpg?w=480&auto=format%2Ccompress&fit=max" },
                { name: "Manali, India", description: "Snow-capped peaks and trekking routes.", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRvGCXwNtpGuqv0u6U1vgaz775rZ3DYONUkw&s" },
                { name: "Banff National Park, Canada", description: "Turquoise lakes and mountain trails.", img: "https://banffnationalpark.com/wp-content/uploads/2009/06/pexels-photo-417074.jpeg" }
            ],
            festival: [
                { name: "Rio de Janeiro, Brazil", description: "Known for the famous Carnival festival.", img: "https://www.pandotrip.com/wp-content/uploads/2022/07/Christ-the-Redeemer-Rio-de-Janeiro-Brazil.jpg" },
                { name: "Nagaland, India", description: "Experience the colorful Hornbill Festival.", img: "https://tripandtales.com/wp-content/uploads/2025/06/Hills-of-Nagaland.jpg" },
                { name: "Munich, Germany", description: "Home of the world-renowned Oktoberfest.", img: "https://a.travel-assets.com/findyours-php/viewfinder/images/res70/501000/501501-munich.jpg" }
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
