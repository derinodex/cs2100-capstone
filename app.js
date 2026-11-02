// Clean one breed object to only keep what we need
function formatBreed(breed) {
    return {
        name: breed.name,
        temperament: breed.temperament || "N/A",
        lifespan: breed.life_span,
        weight: breed.weight.imperial + " lbs",
        image: breed.image ? breed.image.url : "No image"
    };
}

// Fetch dog breeds from the API
async function getBreeds() {
    const url = "https://api.thedogapi.com/v1/breeds";

    try {
        const res = await fetch(url, {
            headers: {
                "x-api-key": "live_rQv6815U15p7x1qXo8X3s7Uq9gZq"
            }
        });

        const data = await res.json();

        // raw data into cleaned data
        const cleanList = data.map(formatBreed);

        console.log("Breeds from API:", cleanList);
    } catch (err) {
        console.log("Fetch failed:", err);
    }
}

getBreeds();