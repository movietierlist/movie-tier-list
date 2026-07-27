const addButton = document.getElementById("addMovie");
const tierContainer = document.getElementById("tierContainer");


const tiers = [
    {
        name: "S",
        emoji: "⭐",
        colour: "s"
    },
    {
        name: "A",
        emoji: "🔥",
        colour: "a"
    },
    {
        name: "B",
        emoji: "👍",
        colour: "b"
    },
    {
        name: "C",
        emoji: "🙂",
        colour: "c"
    },
    {
        name: "D",
        emoji: "😐",
        colour: "d"
    },
    {
        name: "F",
        emoji: "💀",
        colour: "f"
    }
];


let movies = JSON.parse(localStorage.getItem("movies")) || [];


function saveMovies() {
    localStorage.setItem("movies", JSON.stringify(movies));
}



function createTier(tier) {

    const section = document.createElement("section");

    section.className = `tier ${tier.colour}`;


    section.innerHTML = `
        <div class="tier-header">
            <h2>${tier.name} ${tier.emoji}</h2>
        </div>

        <div class="movies" data-tier="${tier.name}"></div>
    `;


    const movieArea = section.querySelector(".movies");


    movieArea.addEventListener("dragover", e => {
        e.preventDefault();
    });


    movieArea.addEventListener("drop", e => {

        const dragged =
            document.querySelector(".dragging");


        if (!dragged) return;


        const movie = movies.find(
            m => m.id == dragged.dataset.id
        );


        movie.tier = tier.name;

        saveMovies();

        renderMovies();

    });


    tierContainer.appendChild(section);
}



function createMovieCard(movie) {


    const card = document.createElement("div");

    card.className = "movie-card";

    card.draggable = true;

    card.dataset.id = movie.id;


    card.innerHTML = `

        <div class="poster">
            🎬
        </div>

        <div class="movie-title">
            ${movie.title}
        </div>


        <button class="menu-button">
            ⋮
        </button>


        <div class="menu hidden">

            <button class="edit">
                Edit
            </button>

            <button class="delete">
                Delete
            </button>

        </div>

    `;



    const menuButton =
        card.querySelector(".menu-button");


    const menu =
        card.querySelector(".menu");



    menuButton.onclick = () => {

        menu.classList.toggle("hidden");

    };



    card.querySelector(".edit").onclick = () => {

        const updated =
            prompt(
                "Movie name:",
                movie.title
            );


        if (updated) {

            movie.title = updated;

            saveMovies();

            renderMovies();

        }

    };



    card.querySelector(".delete").onclick = () => {

        movies =
            movies.filter(
                m => m.id !== movie.id
            );


        saveMovies();

        renderMovies();

    };



    card.addEventListener(
        "dragstart",
        () => {
            card.classList.add("dragging");
        }
    );


    card.addEventListener(
        "dragend",
        () => {
            card.classList.remove("dragging");
        }
    );



    return card;

}



function renderMovies() {


    document.querySelectorAll(".movies")
        .forEach(area => {
            area.innerHTML = "";
        });



    movies.forEach(movie => {


        const tier =
            document.querySelector(
                `[data-tier="${movie.tier}"]`
            );


        if (tier) {

            tier.appendChild(
                createMovieCard(movie)
            );

        }

    });

}




addButton.onclick = () => {


    const title =
        prompt(
            "Movie name:"
        );


    if (!title) return;



    movies.push({

        id: Date.now(),

        title: title,

        tier: "C",

        poster: ""

    });


    saveMovies();

    renderMovies();

};




tiers.forEach(createTier);


renderMovies();
