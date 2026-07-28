/* =============================
   MOVIE CLUB SCRIPT
   Part 1/3
============================= */


/* =============================
   DOM ELEMENTS
============================= */

const addMovieButton =
    document.getElementById("addMovie");

const addTierButton =
    document.getElementById("addTier");

const settingsButton =
    document.getElementById("settingsButton");

const settingsPanel =
    document.getElementById("settingsPanel");

const tierContainer =
    document.getElementById("tierContainer");

const movieBank =
    document.getElementById("movieBank");



/* =============================
   MODAL SYSTEM
============================= */

const modalOverlay =
    document.getElementById("modalOverlay");

const modalTitle =
    document.getElementById("modalTitle");

const modalContent =
    document.getElementById("modalContent");

const modalCancel =
    document.getElementById("modalCancel");

const modalConfirm =
    document.getElementById("modalConfirm");


let modalAction = null;



function openModal(
    title,
    content,
    confirmText,
    action
) {


    modalTitle.textContent =
        title;


    modalContent.innerHTML =
        content;


    modalConfirm.textContent =
        confirmText || "Save";


    modalAction =
        action;


    modalOverlay.classList.remove(
        "hidden"
    );


    const input =
        modalContent.querySelector("input");


    if(input) {

        input.focus();

    }

}



function closeModal() {


    modalOverlay.classList.add(
        "hidden"
    );


    modalContent.innerHTML =
        "";


    modalAction =
        null;

}



modalCancel.onclick =
function() {

    closeModal();

};



modalConfirm.onclick =
function() {


    if(modalAction) {

        modalAction();

    }


    closeModal();

};



document.addEventListener(
    "keydown",
    function(event) {


        if(
            modalOverlay.classList.contains(
                "hidden"
            )
        ) {

            return;

        }



        if(event.key === "Escape") {

            closeModal();

        }



        if(event.key === "Enter") {

            modalConfirm.click();

        }


    }
);




/* =============================
   CONTEXT MENUS
============================= */


let activeMenu = null;



function closeMenus() {


    if(activeMenu) {

        activeMenu.remove();

        activeMenu = null;

    }

}




document.addEventListener(
    "click",
    function(event) {


        if(
            !event.target.closest(
                ".context-menu"
            )
            &&
            !event.target.closest(
                ".movie-menu"
            )
            &&
            !event.target.closest(
                ".tier-menu"
            )
        ) {

            closeMenus();

        }


    }
);





function showMenu(button, items) {


    closeMenus();



    const menu =
        document.createElement(
            "div"
        );


    menu.className =
        "context-menu";



    items.forEach(item => {


        const option =
            document.createElement(
                "button"
            );


        option.textContent =
            item.label;



        option.onclick =
        function(event) {


            event.stopPropagation();


            closeMenus();


            item.action();


        };



        menu.appendChild(
            option
        );


    });



    document.body.appendChild(
        menu
    );



    const rect =
        button.getBoundingClientRect();



    const menuWidth =
        170;



    let left =
        rect.left + window.scrollX;



    if(
        left + menuWidth >
        window.innerWidth - 10
    ) {

        left =
            window.innerWidth -
            menuWidth -
            10;

    }



    menu.style.top =
        rect.bottom +
        window.scrollY +
        "px";



    menu.style.left =
        left +
        "px";



    activeMenu =
        menu;

}






/* =============================
   DEVICE DETECTION
============================= */


function detectDevice() {


    const hasHover =
        window.matchMedia(
            "(hover: hover)"
        ).matches;


    const hasTouch =
        "ontouchstart" in window;


    const width =
        window.innerWidth;



    let device;



    if(hasHover) {

        device =
            "desktop";

    }

    else if(
        hasTouch &&
        width >= 768
    ) {

        device =
            "tablet";

    }

    else {

        device =
            "mobile";

    }



    document.body.dataset.device =
        device;

}



detectDevice();



window.addEventListener(
    "resize",
    detectDevice
);





/* =============================
   DATA
============================= */


let data =
    JSON.parse(
        localStorage.getItem(
            "movieClub"
        )
    )
    ||
    {


        settings: {

            cardStyle:
                "title"

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




if(!data.settings) {

    data.settings = {

        cardStyle:
            "title"

    };

}



function save() {


    localStorage.setItem(
        "movieClub",
        JSON.stringify(data)
    );

}

/* =============================
   TIER CREATION
============================= */


function createTier(tier) {


    const section =
        document.createElement("section");


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
        section.querySelector(
            ".tier-menu"
        );



    menuButton.onclick =
    function(event) {


        event.stopPropagation();


        openTierMenu(
            tier,
            this
        );


    };



    const movieArea =
        section.querySelector(
            ".movies"
        );



    setupDropZone(
        movieArea,
        tier.id
    );



    tierContainer.appendChild(
        section
    );

}





function openTierMenu(
    tier,
    button
) {


    showMenu(

        button,

        [


            {

                label: "Rename Tier",


                action: function() {


                    openModal(

                        "Rename Tier",

                        `
                        <input
                            id="tierNameInput"
                            value="${tier.name}"
                        >
                        `,

                        "Rename",


                        function() {


                            const name =
                                document
                                .getElementById(
                                    "tierNameInput"
                                )
                                .value
                                .trim();



                            if(name) {

                                tier.name =
                                    name;


                                save();

                                render();

                            }


                        }

                    );


                }


            },



            {


                label: "Change Colour",


                action: function() {


                    openModal(

                        "Change Colour",

                        `
                        <input
                            id="tierColourInput"
                            value="${tier.colour}"
                            placeholder="Colour code"
                        >
                        `,


                        "Change",


                        function() {


                            const colour =
                                document
                                .getElementById(
                                    "tierColourInput"
                                )
                                .value
                                .trim();



                            if(colour) {

                                tier.colour =
                                    colour;


                                save();

                                render();

                            }


                        }

                    );


                }


            },



            {


                label: "Delete Tier",


                action: function() {


                    openModal(

                        "Delete Tier",

                        `
                        <p>
                        Delete this tier?
                        Movies will return to Movie Bank.
                        </p>
                        `,


                        "Delete",


                        function() {


                            data.movies.forEach(
                                movie => {


                                    if(
                                        movie.tier === tier.id
                                    ) {

                                        movie.tier =
                                            null;

                                    }


                                }
                            );



                            data.tiers =
                                data.tiers.filter(
                                    t =>
                                    t.id !== tier.id
                                );



                            save();

                            render();


                        }

                    );


                }


            }


        ]

    );


}






/* =============================
   DRAG AND DROP
============================= */


function setupDropZone(
    area,
    tierID
) {


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
                event.dataTransfer.getData(
                    "id"
                );



            const movie =
                data.movies.find(
                    m =>
                    m.id == id
                );



            if(movie) {


                movie.tier =
                    tierID;


                save();

                render();


            }


        }
    );

}






/* =============================
   MOVIE CREATION
============================= */


function createMovie(movie) {


    const card =
        document.createElement(
            "div"
        );



    card.className =
        "movie-card";



    card.draggable =
        true;



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
        card.querySelector(
            ".movie-menu"
        );



    menuButton.onclick =
    function(event) {


        event.stopPropagation();


        openMovieMenu(
            movie,
            this
        );


    };



    return card;

}





function openMovieMenu(
    movie,
    button
) {


    showMenu(

        button,

        [


            {


                label: "Edit Movie",


                action: function() {


                    openModal(

                        "Edit Movie",

                        `
                        <input
                            id="movieNameInput"
                            value="${movie.title}"
                        >
                        `,


                        "Save",


                        function() {


                            const name =
                                document
                                .getElementById(
                                    "movieNameInput"
                                )
                                .value
                                .trim();



                            if(name) {


                                movie.title =
                                    name;


                                save();

                                render();


                            }


                        }


                    );


                }


            },



            {


                label: "Delete Movie",


                action: function() {


                    openModal(

                        "Delete Movie",

                        `
                        <p>
                        Delete this movie?
                        </p>
                        `,


                        "Delete",


                        function() {


                            data.movies =
                                data.movies.filter(
                                    m =>
                                    m.id !== movie.id
                                );



                            save();

                            render();


                        }


                    );


                }


            }


        ]

    );


}


/* =============================
   RENDER
============================= */


function render() {


    tierContainer.innerHTML =
        "";

    movieBank.innerHTML =
        "";



    data.tiers
        .sort(
            (a,b) =>
            a.order - b.order
        )
        .forEach(
            createTier
        );



    data.movies.forEach(
        movie => {


            let location;



            if(movie.tier) {


                location =
                    document.querySelector(
                        `[data-tier="${movie.tier}"]`
                    );


            }
            else {


                location =
                    movieBank;


            }



            if(location) {


                location.appendChild(
                    createMovie(movie)
                );


            }


        }
    );


}







/* =============================
   ADD MOVIE
============================= */


addMovieButton.onclick =
function() {


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
                document
                .getElementById(
                    "movieNameInput"
                )
                .value
                .trim();



            if(!title) return;



            data.movies.push({

                id:
                    Date.now(),

                title:
                    title,

                tier:
                    null,

                poster:
                    ""

            });



            save();

            render();


        }

    );


};







/* =============================
   ADD TIER
============================= */


addTierButton.onclick =
function() {


    openModal(

        "Add Tier",

        `
        <input
            id="tierNameInput"
            placeholder="Tier name"
        >
        `,


        "Add",


        function() {


            const name =
                document
                .getElementById(
                    "tierNameInput"
                )
                .value
                .trim();



            if(!name) return;



            data.tiers.push({

                id:
                    Date.now(),

                name:
                    name,

                emoji:
                    "",

                colour:
                    "c",

                order:
                    data.tiers.length

            });



            save();

            render();


        }

    );


};








/* =============================
   SETTINGS
============================= */


settingsButton.onclick =
function() {


    settingsPanel.classList.toggle(
        "hidden"
    );


};





document
.querySelectorAll(
    'input[name="cardStyle"]'
)
.forEach(
    option => {


        option.checked =
            option.value ===
            data.settings.cardStyle;



        option.onchange =
        function() {


            data.settings.cardStyle =
                option.value;



            save();

            render();


        };


    }
);







/* =============================
   START APP
============================= */


render();
