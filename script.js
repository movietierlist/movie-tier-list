const addButton = document.getElementById("addMovie");

const tiers = document.querySelectorAll(".movies");

let movies = JSON.parse(localStorage.getItem("movies")) || [];


function saveMovies() {
    localStorage.setItem("movies", JSON.stringify(movies));
}


function createMovieCard(movie) {

    const card = document.createElement("div");

    card.className = "movie-card";
    card.textContent = movie.title;

    card.draggable = true;

    card.dataset.id = movie.id;


    card.addEventListener("dragstart", () => {
        card.classList.add("dragging");
    });


    card.addEventListener("dragend", () => {
        card.classList.remove("dragging");
    });


    return card;
}


function renderMovies() {

    tiers.forEach(tier => {
        tier.innerHTML = "";
    });


    movies.forEach(movie => {

        const tier = document.querySelector(
            `[data-tier="${movie.tier}"]`
        );

        if (tier) {
            tier.appendChild(createMovieCard(movie));
        }

    });

}


addButton.addEventListener("click", () => {

    const title = prompt("Movie name:");

    if (!title) return;


    const movie = {
        id: Date.now(),
        title: title,
        tier: "C"
    };


    movies.push(movie);

    saveMovies();

    renderMovies();

});



tiers.forEach(tier => {


    tier.addEventListener("dragover", event => {
        event.preventDefault();
    });


    tier.addEventListener("drop", event => {

        event.preventDefault();


        const dragged =
            document.querySelector(".dragging");


        if (!dragged) return;


        const movie = movies.find(
            m => m.id == dragged.dataset.id
        );


        movie.tier = tier.dataset.tier;


        saveMovies();

        renderMovies();

    });

});


renderMovies();
