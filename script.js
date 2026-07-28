const addMovieButton = document.getElementById("addMovie");
const addTierButton = document.getElementById("addTier");

const settingsButton = document.getElementById("settingsButton");
const settingsPanel = document.getElementById("settingsPanel");

const tierContainer = document.getElementById("tierContainer");
const movieBank = document.getElementById("movieBank");

const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const modalContent = document.getElementById("modalContent");
const modalCancel = document.getElementById("modalCancel");
const modalConfirm = document.getElementById("modalConfirm");


let modalAction = null;



function openModal(title, content, confirmText, action) {


    modalTitle.textContent = title;


    modalContent.innerHTML = content;


    modalConfirm.textContent = confirmText || "Save";


    modalAction = action;


    modalOverlay.classList.remove("hidden");

}



function closeModal() {


    modalOverlay.classList.add("hidden");


    modalContent.innerHTML = "";


    modalAction = null;


}



modalCancel.onclick = function() {

    closeModal();

};



modalConfirm.onclick = function() {


    if(modalAction) {

        modalAction();

    }


    closeModal();

};

let activeMenu = null;


/* -----------------------------
   MENU SYSTEM
----------------------------- */

function closeMenus() {

    if (activeMenu) {

        activeMenu.remove();

        activeMenu = null;

    }

}


document.addEventListener("click", function(event) {

    if (
        !event.target.closest(".context-menu") &&
        !event.target.closest(".movie-menu") &&
        !event.target.closest(".tier-menu")
    ) {

        closeMenus();

    }

});


function showMenu(button, items) {

    closeMenus();


    const menu = document.createElement("div");

    menu.className = "context-menu";


    items.forEach(item => {

        const option = document.createElement("button");

        option.textContent = item.label;


        option.onclick = function(event) {

            event.stopPropagation();

            closeMenus();

            item.action();

        };


        menu.appendChild(option);

    });


    document.body.appendChild(menu);


    const rect = button.getBoundingClientRect();


    menu.style.top =
        rect.bottom + window.scrollY + "px";


    menu.style.left =
    rect.right - 170 + window.scrollX + "px";


    activeMenu = menu;

}



/* -----------------------------
   DEVICE DETECTION
----------------------------- */

function detectDevice() {

    const hasHover =
        window.matchMedia("(hover: hover)").matches;


    const hasTouch =
        "ontouchstart" in window;


    const width =
        window.innerWidth;


    let device;


    if (hasHover) {

        device = "desktop";

    }

    else if (hasTouch && width >= 768) {

        device = "tablet";

    }

    else {

        device = "mobile";

    }


    document.body.dataset.device = device;

}


detectDevice();


window.addEventListener(
    "resize",
    detectDevice
);



/* -----------------------------
   DATA
----------------------------- */

let data =
    JSON.parse(
        localStorage.getItem("movieClub")
    )
    ||
    {

        settings: {

            cardStyle: "title"

        },


        tiers: [

            {
                id: 1,
                name: "S",
                emoji: "",
                colour: "s",
                order: 0
            },

            {
                id: 2,
                name: "A",
                emoji: "",
                colour: "a",
                order: 1
            },

            {
                id: 3,
                name: "B",
                emoji: "",
                colour: "b",
                order: 2
            },

            {
                id: 4,
                name: "C",
                emoji: "",
                colour: "c",
                order: 3
            },

            {
                id: 5,
                name: "D",
                emoji: "",
                colour: "d",
                order: 4
            },

            {
                id: 6,
                name: "F",
                emoji: "",
                colour: "f",
                order: 5
            }

        ],


        movies: []

    };



if (!data.settings) {

    data.settings = {
        cardStyle: "title"
    };

}



function save() {

    localStorage.setItem(
        "movieClub",
        JSON.stringify(data)
    );

}


/* -----------------------------
   TIER CREATION
----------------------------- */

function createTier(tier) {


    const section = document.createElement("section");


    section.className =
        "tier " + tier.colour;



    section.innerHTML = `

        <div class="tier-title">

            <h2>
                ${tier.name}${tier.emoji ? " " + tier.emoji : ""}
            </h2>


            <button class="tier-menu">
                ⋮
            </button>

        </div>


        <div
            class="movies"
            data-tier="${tier.id}">
        </div>

    `;



    const menuButton =
        section.querySelector(".tier-menu");


    menuButton.onclick = function(event) {

        event.stopPropagation();

        openTierMenu(
            tier,
            this
        );

    };



    const movieArea =
        section.querySelector(".movies");


    setupDropZone(
        movieArea,
        tier.id
    );



    tierContainer.appendChild(section);

}





function openTierMenu(tier, button) {


    showMenu(

        button,

        [

            {
                label: "Rename Tier",

                action: function() {


                    const name =
                        prompt(
                            "Tier name:",
                            tier.name
                        );


                    if(name) {

                        tier.name = name;

                        save();

                        render();

                    }

                }

            },


            {
                label: "Change Colour",

                action: function() {


                    const colour =
                        prompt(
                            "Colour code:",
                            tier.colour
                        );


                    if(colour) {

                        tier.colour = colour;

                        save();

                        render();

                    }

                }

            },


            {
                label: "Delete Tier",

                action: function() {


                    if(
                        confirm(
                            "Delete tier? Movies return to Movie Bank."
                        )
                    ) {


                        data.movies.forEach(movie => {


                            if(movie.tier === tier.id) {

                                movie.tier = null;

                            }


                        });



                        data.tiers =
                            data.tiers.filter(
                                t => t.id !== tier.id
                            );



                        save();

                        render();


                    }

                }

            }

        ]

    );

}





/* -----------------------------
   DRAG AND DROP
----------------------------- */


function setupDropZone(area, tierID) {


    area.addEventListener(
        "dragover",
        event => {

            event.preventDefault();

        }
    );



    area.addEventListener(
        "drop",
        event => {


            const id =
                event.dataTransfer.getData("id");



            const movie =
                data.movies.find(
                    m => m.id == id
                );



            if(movie) {


                movie.tier = tierID;

                save();

                render();

            }

        }
    );

}







/* -----------------------------
   MOVIE CREATION
----------------------------- */


function createMovie(movie) {


    const card =
        document.createElement("div");


    card.className =
        "movie-card";


    card.draggable = true;



    card.innerHTML = `

        <div class="poster">
            🎬
        </div>


        <div class="movie-title">
            ${movie.title}
        </div>


        <button class="movie-menu">
            ⋮
        </button>

    `;



    if(
        data.settings.cardStyle === "poster"
    ) {

        card.classList.add(
            "poster-only"
        );

    }





    card.addEventListener(
        "dragstart",
        event => {


            event.dataTransfer.setData(
                "id",
                movie.id
            );


        }
    );





    const menuButton =
        card.querySelector(".movie-menu");



    menuButton.onclick = function(event) {


        event.stopPropagation();


        openMovieMenu(
            movie,
            this
        );


    };



    return card;

}






function openMovieMenu(movie, button) {


    showMenu(

        button,

        [

            {
                label: "Edit Movie",

                action: function() {


                    const name =
                        prompt(
                            "Movie name:",
                            movie.title
                        );


                    if(name) {

                        movie.title = name;

                        save();

                        render();

                    }


                }

            },


            {
                label: "Delete Movie",

                action: function() {


                    data.movies =
                        data.movies.filter(
                            m => m.id !== movie.id
                        );


                    save();

                    render();


                }

            }

        ]

    );


}


/* -----------------------------
   RENDER
----------------------------- */


function render() {


    tierContainer.innerHTML = "";

    movieBank.innerHTML = "";



    data.tiers
        .sort(
            (a,b) =>
                a.order - b.order
        )
        .forEach(createTier);





    data.movies.forEach(movie => {


        let location;



        if(movie.tier) {


            location =
                document.querySelector(
                    `[data-tier="${movie.tier}"]`
                );


        }
        else {


            location = movieBank;


        }




        if(location) {


            location.appendChild(
                createMovie(movie)
            );


        }


    });


}





/* -----------------------------
   ADD MOVIE
----------------------------- */


addMovieButton.onclick = function() {


    openModal(

        "Add Movie",

        `
        <input 
            id="movieNameInput"
            placeholder="Movie name"
        >
        `,

        "Add",

        function() {


            const title =
                document.getElementById(
                    "movieNameInput"
                ).value.trim();



            if(!title) return;



            data.movies.push({

                id: Date.now(),

                title: title,

                tier: null,

                poster: ""

            });



            save();

            render();


        }

    );


};





/* -----------------------------
   ADD TIER
----------------------------- */


addTierButton.onclick = function() {


    const name =
        prompt(
            "Tier name:"
        );



    if(!name) return;



    data.tiers.push({

        id: Date.now(),

        name: name,

        emoji: "",

        colour: "c",

        order: data.tiers.length

    });



    save();

    render();


};






/* -----------------------------
   SETTINGS
----------------------------- */


settingsButton.onclick = function() {


    settingsPanel.classList.toggle(
        "hidden"
    );


};






document
.querySelectorAll(
    'input[name="cardStyle"]'
)
.forEach(option => {



    option.checked =
        option.value === data.settings.cardStyle;



    option.onchange = function() {


        data.settings.cardStyle =
            option.value;



        save();

        render();


    };


});






/* -----------------------------
   START
----------------------------- */


render();


