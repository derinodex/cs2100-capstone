let allBreeds = [];

const form = document.getElementById("filter-form");
const searchInput = document.getElementById("search-input");
const minWeightInput = document.getElementById("min-weight");
const maxLifespanInput = document.getElementById("max-lifespan");
const sortSelect = document.getElementById("sort-select");
const resetBtn = document.getElementById("reset-btn");

const searchError = document.getElementById("search-error");
const weightError = document.getElementById("weight-error");
const lifespanError = document.getElementById("lifespan-error");

const breedsContainer = document.getElementById("breeds-container");
const breedCount = document.getElementById("breed-count");
const statusMsg = document.getElementById("status-msg");

// grab the first number so i can filter
function parseFirstNumber(str) {
    if (!str) return null;
    const match = str.match(/\d+/);
    return match ? Number(match[0]) : null;
}

function formatBreed(breed) {
    const rawWeight = breed.weight && breed.weight.imperial ? breed.weight.imperial : "";
    return {
        name: breed.name || "Unknown Breed",
        temperament: breed.temperament || "N/A",
        lifespan: breed.life_span || "N/A",
        weight: rawWeight ? rawWeight + " lbs" : "N/A",
        minWeightNum: parseFirstNumber(rawWeight),
        lifespanNum: parseFirstNumber(breed.life_span),
        image: breed.image && breed.image.url ? breed.image.url : ""
    };
}

// i built cards in a fragment first for speed
function renderBreeds(list) {
    breedsContainer.textContent = "";
    breedCount.textContent = String(list.length);

    if (list.length === 0) {
        statusMsg.textContent = "No matching breeds found.";
        return;
    }

    statusMsg.textContent = "";
    const fragment = document.createDocumentFragment();

    list.forEach((breed) => {
        const card = document.createElement("article");
        card.className = "breed-card";

        if (breed.image) {
            const img = document.createElement("img");
            img.src = breed.image;
            img.alt = breed.name;
            card.appendChild(img);
        }

        const title = document.createElement("h3");
        title.textContent = breed.name;

        const weightP = document.createElement("p");
        weightP.textContent = "Weight: " + breed.weight;

        const lifeP = document.createElement("p");
        lifeP.textContent = "Lifespan: " + breed.lifespan;

        const tempP = document.createElement("p");
        tempP.textContent = "Temperament: " + breed.temperament;

        card.appendChild(title);
        card.appendChild(weightP);
        card.appendChild(lifeP);
        card.appendChild(tempP);

        fragment.appendChild(card);
    });

    breedsContainer.appendChild(fragment);
}

// i check the three inputs and show inline errors
function validateForm() {
    let valid = true;

    searchError.textContent = "";
    weightError.textContent = "";
    lifespanError.textContent = "";

    const keyword = searchInput.value.trim();
    const minWeightRaw = minWeightInput.value.trim();
    const maxLifeRaw = maxLifespanInput.value.trim();

    if (keyword.length > 40) {
        searchError.textContent = "Keyword must be 40 characters or less.";
        valid = false;
    }

    if (minWeightRaw !== "") {
        const minWeight = Number(minWeightRaw);
        if (Number.isNaN(minWeight) || minWeight < 1 || minWeight > 250) {
            weightError.textContent = "Enter a weight between 1 and 250 lbs.";
            valid = false;
        }
    }

    if (maxLifeRaw !== "") {
        const maxLife = Number(maxLifeRaw);
        if (Number.isNaN(maxLife) || maxLife < 1 || maxLife > 30) {
            lifespanError.textContent = "Enter a lifespan between 1 and 30 years.";
            valid = false;
        }
    }

    return valid;
}

function updateDisplay() {
    if (!validateForm()) return;

    const keyword = searchInput.value.trim().toLowerCase();
    const minWeight = minWeightInput.value.trim() !== "" ? Number(minWeightInput.value) : null;
    const maxLife = maxLifespanInput.value.trim() !== "" ? Number(maxLifespanInput.value) : null;
    const sortBy = sortSelect.value;

    const filtered = allBreeds.filter((breed) => {
        const matchesName = !keyword || breed.name.toLowerCase().includes(keyword);
        const matchesWeight = minWeight === null || (breed.minWeightNum !== null && breed.minWeightNum >= minWeight);
        const matchesLife = maxLife === null || (breed.lifespanNum !== null && breed.lifespanNum <= maxLife);
        return matchesName && matchesWeight && matchesLife;
    });
//comparison
    filtered.sort((a, b) => {
        if (sortBy === "name-desc") {
            return b.name.localeCompare(a.name);
        }
        return a.name.localeCompare(b.name);
    });

    renderBreeds(filtered);
}
//Fetch from api
async function getBreeds() {
    const url = "https://api.thedogapi.com/v1/breeds";

    try {
        const res = await fetch(url, {
            headers: {
                "x-api-key": "live_rQv6815U15p7x1qXo8X3s7Uq9gZq"
            }
        });

        const data = await res.json();
        allBreeds = data.map(formatBreed);
        updateDisplay();
    } catch (err) {
        statusMsg.textContent = "Could not load breeds right now.";
        console.log("Fetch failed:", err);
    }
}

// wire events so filtering happens live
form.addEventListener("submit", (e) => {
    e.preventDefault();
    updateDisplay();
});

searchInput.addEventListener("input", updateDisplay);
sortSelect.addEventListener("change", updateDisplay);

resetBtn.addEventListener("click", () => {
    form.reset();
    searchError.textContent = "";
    weightError.textContent = "";
    lifespanError.textContent = "";
    updateDisplay();
});

getBreeds();