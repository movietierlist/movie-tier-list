const addButton = document.getElementById("addMovie");

const tiers = document.querySelectorAll(".movies");

let movies = JSON.parse(localStorage.getItem("movies")) || [];


function saveMovies() {
    localStorage.setItem("movies", JSON.stringify(movies));
}


function createMovieCard(movie) {

    const card = document.createElement("div");

    card.className = "movie-card";
    card.draggable = true;
    card.dataset.id = movie.id;


    const title = document.createElement("span");
    title.textContent = movie.title;


    const editButton = document.createElement("button");
    editButton.textContent = "✏️";
    editButton.className = "edit-button";


    const deleteButton = document.createElement("button");
    deleteButton.textContent = "✕";
    deleteButton.className = "delete-button";


    editButton.onclick = () => {

        const newTitle = prompt(
            "Edit movie name:",
            movie.title
        );

        if (newTitle) {
            movie.title = newTitle;
            saveMovies();
            renderMovies();
        }

    };


    deleteButton.onclick = () => {

        const confirmDelete = confirm(
            `Delete "${movie.title}"?`
        );

        if (confirmDelete) {

            movies = movies.filter(
                m => m.id !== movie.id
            );

            saveMovies();
            renderMovies();

        }

    };


    card.appendChild(title);
    card.appendChild(editButton);
    card.appendChild(deleteButton);


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
            tier.appendChild(
                createMovieCard(movie)
            );
        }

    });

}



addButton.addEventListener("click", () => {

    const title = prompt(
        "Movie name:"
    );


    if (!title) return;


    const movie = {

        id: Date.now(),

        title: title,

        tier: "C",

        poster: "",

        notes: ""

    };


    movies.push(movie);


    saveMovies();

    renderMovies();

});



tiers.forEach(tier => {


    tier.addEventListener(
        "dragover",
        event => {
            event.preventDefault();
        }
    );


    tier.addEventListener(
        "drop",
        event => {


            event.preventDefault();


            const dragged =
                document.querySelector(".dragging");


            if (!dragged) return;


            const movie = movies.find(
                m => m.id == dragged.dataset.id
            );


            movie.tier =
                tier.dataset.tier;


            saveMovies();

            renderMovies();

        }
    );

});


renderMovies();
