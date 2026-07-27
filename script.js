const addButton = document.getElementById("addMovie");
const addTierButton = document.getElementById("addTier");

const tierContainer = document.getElementById("tierContainer");
const movieBank = document.getElementById("movieBank");


let data = JSON.parse(localStorage.getItem("movieClub")) || {

    tiers: [

        {
            id: 1,
            name: "S",
            emoji: "⭐",
            colour: "s",
            order: 0
        },

        {
            id: 2,
            name: "A",
            emoji: "🔥",
            colour: "a",
            order: 1
        },

        {
            id: 3,
            name: "B",
            emoji: "👍",
            colour: "b",
            order: 2
        },

        {
            id: 4,
            name: "C",
            emoji: "🙂",
            colour: "c",
            order: 3
        },

        {
            id: 5,
            name: "D",
            emoji: "😐",
            colour: "d",
            order: 4
        },

        {
            id: 6,
            name: "F",
            emoji: "💀",
            colour: "f",
            order: 5
        }

    ],

    movies: []

};



function save() {

    localStorage.setItem(
        "movieClub",
        JSON.stringify(data)
    );

}




function createTier(tier) {


    const section = document.createElement("section");

    section.className = "tier " + tier.colour;


    section.innerHTML = `

        <div class="tier-title">

            <h2>
                ${tier.name} ${tier.emoji}
            </h2>

            <button class="tier-menu">
                ⋮
            </button>

        </div>


        <div class="movies" data-tier="${tier.id}"></div>

    `;



    const menu = section.querySelector(".tier-menu");


    menu.onclick = function() {


        const choice = prompt(
            "Tier options:\n\n" +
            "1 - Rename tier\n" +
            "2 - Change colour\n" +
            "3 - Delete tier"
        );



        if (choice === "1") {


            const newName = prompt(
                "New tier name:",
                tier.name
            );


            if (newName) {

                tier.name = newName;

                save();

                render();

            }

        }



        if (choice === "2") {


            const newColour = prompt(
                "Choose colour:\n\n" +
                "s = Red\n" +
                "a = Orange\n" +
                "b = Yellow\n" +
                "c = Green\n" +
                "d = Blue\n" +
                "f = Grey"
            );


            if (newColour) {

                tier.colour = newColour;

                save();

                render();

            }

        }



        if (choice === "3") {


            const confirmed = confirm(
                "Delete this tier? Movies will return to Movie Bank."
            );


            if (confirmed) {


                data.movies.forEach(function(movie) {

                    if (movie.tier === tier.id) {

                        movie.tier = null;

                    }

                });



                data.tiers = data.tiers.filter(
                    function(t) {
                        return t.id !== tier.id;
                    }
                );


                save();

                render();

            }

        }

    };



    const area = section.querySelector(".movies");


    setupDrop(area, tier.id);



    tierContainer.appendChild(section);

}





function setupDrop(area, tierID) {


    area.addEventListener(
        "dragover",
        function(event) {

            event.preventDefault();

        }
    );



    area.addEventListener(
        "drop",
        function(event) {


            const id = event.dataTransfer.getData("id");


            const movie = data.movies.find(
                function(m) {
                    return m.id == id;
                }
            );



            if (movie) {

                movie.tier = tierID;

                save();

                render();

            }

        }
    );

}




function createMovie(movie) {


    const card = document.createElement("div");


    card.className = "movie-card";

    card.draggable = true;



    card.innerHTML = `

        <div class="poster">
            🎬
        </div>

        <div class="movie-title">
            ${movie.title}
        </div>

    `;



    card.addEventListener(
        "dragstart",
        function(event) {

            event.dataTransfer.setData(
                "id",
                movie.id
            );

        }
    );



    return card;

}





function render() {


    tierContainer.innerHTML = "";

    movieBank.innerHTML = "";



    data.tiers.sort(
        function(a, b) {

            return a.order - b.order;

        }
    );



    data.tiers.forEach(
        function(tier) {

            createTier(tier);

        }
    );



    data.movies.forEach(
        function(movie) {


            let location;



            if (movie.tier) {


                location =
                document.querySelector(
                    `[data-tier="${movie.tier}"]`
                );


            } else {


                location = movieBank;


            }



            if (location) {

                location.appendChild(
                    createMovie(movie)
                );

            }


        }
    );


}





addButton.onclick = function() {


    const title = prompt(
        "Movie name:"
    );


    if (!title) return;



    data.movies.push({

        id: Date.now(),

        title: title,

        poster: "",

        tier: null

    });



    save();

    render();

};





addTierButton.onclick = function() {


    const name = prompt(
        "Tier name:"
    );


    if (!name) return;



    data.tiers.push({

        id: Date.now(),

        name: name,

        emoji: "🎬",

        colour: "c",

        order: data.tiers.length

    });



    save();

    render();

};





render();
