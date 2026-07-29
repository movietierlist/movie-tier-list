/* ==================================
   MOVIE TIER LIST APP
   Version 2.1 TierMaker Clean Build

   SCRIPT PART 1/5
================================== */


/* ==================================
   DOM REFERENCES
================================== */


const addMovieButton =
    document.getElementById("addMovie");


const addMultipleMoviesButton =
    document.getElementById("addMultipleMovies");


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



/* ==================================
   MODAL SYSTEM
================================== */


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
        modalContent.querySelector(
            "input, textarea"
        );



    if(input) {

        setTimeout(
            () => input.focus(),
            50
        );

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
function(){

    closeModal();

};





modalConfirm.onclick =
function(){


    if(modalAction){

        modalAction();

    }


    closeModal();


};






document.addEventListener(
    "keydown",
    function(event){


        if(
            modalOverlay.classList.contains(
                "hidden"
            )
        ){

            return;

        }



        if(event.key === "Escape"){

            closeModal();

        }



        if(
            event.key === "Enter" &&
            event.target.tagName !== "TEXTAREA"
        ){

            modalConfirm.click();

        }


    }
);






/* ==================================
   CONTEXT MENU SYSTEM
================================== */


let activeMenu = null;




function closeMenus(){


    if(activeMenu){

        activeMenu.remove();

        activeMenu = null;

    }


}




document.addEventListener(
    "click",
    function(event){


        if(
            !event.target.closest(".context-menu") &&
            !event.target.closest(".movie-menu") &&
            !event.target.closest(".tier-menu")
        ){

            closeMenus();

        }


    }
);






function showMenu(
    button,
    items
){


    closeMenus();



    const menu =
        document.createElement("div");


    menu.className =
        "context-menu";



    items.forEach(
        item => {


            const option =
                document.createElement("button");



            option.textContent =
                item.label;



            option.onclick =
            function(event){


                event.stopPropagation();


                closeMenus();


                item.action();


            };



            menu.appendChild(option);


        }
    );



    document.body.appendChild(menu);



    const rect =
        button.getBoundingClientRect();



    menu.style.left =
        rect.left +
        window.scrollX +
        "px";



    menu.style.top =
        rect.bottom +
        window.scrollY +
        "px";



    activeMenu =
        menu;


}

/* ==================================
   DATA SYSTEM
================================== */


const defaultColours = [

    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#3b82f6",
    "#8b5cf6",
    "#6b7280"

];





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
                colour: "#ef4444",
                order: 0
            },

            {
                id: 2,
                name: "A",
                colour: "#f97316",
                order: 1
            },

            {
                id: 3,
                name: "B",
                colour: "#eab308",
                order: 2
            },

            {
                id: 4,
                name: "C",
                colour: "#22c55e",
                order: 3
            },

            {
                id: 5,
                name: "D",
                colour: "#3b82f6",
                order: 4
            },

            {
                id: 6,
                name: "F",
                colour: "#6b7280",
                order: 5
            }

        ],


        movies: []


    };






function save(){

    localStorage.setItem(
        "movieClub",
        JSON.stringify(data)
    );

}







/* ==================================
   DATA CLEANUP
================================== */


function cleanupData(){


    if(!data.settings){

        data.settings = {

            cardStyle:
                "title"

        };

    }



    if(!data.tiers){

        data.tiers = [];

    }



    if(!data.movies){

        data.movies = [];

    }




    data.tiers.forEach(
        (tier,index)=>{


            if(
                tier.order === undefined
            ){

                tier.order =
                    index;

            }



            if(!tier.colour){

                tier.colour =
                    "#6b7280";

            }


        }
    );





    data.movies.forEach(
        movie=>{


            if(
                movie.order === undefined
            ){

                movie.order =
                    0;

            }



            if(
                movie.tier === undefined
            ){

                movie.tier =
                    null;

            }


        }
    );



    save();


}




cleanupData();







/* ==================================
   TIER CREATION
================================== */


function createTier(tier){


    const section =
        document.createElement("section");



    section.className =
        "tier";



    section.dataset.tier =
        tier.id;





    section.innerHTML = `


        <div
            class="tier-label"
            style="background:${tier.colour}"
        >


            <button
                class="grab-handle"
                draggable="true"
                title="Drag to reorder tiers"
            >
                ⠿
            </button>



            <h2>
                ${tier.name}
            </h2>


        </div>





        <div class="tier-content">


            <button class="tier-menu">
                ⋮
            </button>



            <div
                class="movies"
                data-tier="${tier.id}"
            >

            </div>


        </div>


    `;





    setupTierDragging(
        section,
        tier
    );





    const menuButton =
        section.querySelector(
            ".tier-menu"
        );



    menuButton.onclick =
    function(event){


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

/* ==================================
   TIER DRAGGING SYSTEM
================================== */


let draggedTier = null;





function setupTierDragging(
    element,
    tier
){


    const grabHandle =
        element.querySelector(
            ".grab-handle"
        );



    grabHandle.addEventListener(
        "dragstart",
        function(event){


            draggedTier =
                tier;



            element.classList.add(
                "dragging"
            );



            event.dataTransfer.effectAllowed =
                "move";


        }
    );





    grabHandle.addEventListener(
        "dragend",
        function(){


            element.classList.remove(
                "dragging"
            );



            draggedTier =
                null;


        }
    );






    element.addEventListener(
        "dragover",
        function(event){


            if(!draggedTier){

                return;

            }



            event.preventDefault();


        }
    );






    element.addEventListener(
        "drop",
        function(event){


            event.preventDefault();



            if(
                !draggedTier ||
                draggedTier.id === tier.id
            ){

                return;

            }





            const newOrder =
                [...data.tiers];





            const from =
                newOrder.findIndex(
                    t =>
                    t.id === draggedTier.id
                );



            const to =
                newOrder.findIndex(
                    t =>
                    t.id === tier.id
                );





            newOrder.splice(
                from,
                1
            );



            newOrder.splice(
                to,
                0,
                draggedTier
            );





            newOrder.forEach(
                (tier,index)=>{

                    tier.order =
                        index;

                }
            );



            data.tiers =
                newOrder;



            save();

            render();


        }
    );


}









/* ==================================
   TIER MENU
================================== */


function openTierMenu(
    tier,
    button
){


    showMenu(

        button,

        [


            {


                label:
                "Rename Tier",



                action:
                function(){


                    openModal(

                        "Rename Tier",


                        `

                        <input
                        id="tierNameInput"
                        value="${tier.name}">

                        `,


                        "Save",



                        function(){


                            const name =
                                document
                                .getElementById(
                                    "tierNameInput"
                                )
                                .value
                                .trim();





                            if(name){


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


                label:
                "Change Colour",



                action:
                function(){


                    openModal(

                        "Change Colour",



                        `

                        <input
                        type="color"
                        id="tierColourInput"
                        value="${tier.colour}">

                        `,


                        "Save",



                        function(){



                            tier.colour =
                                document
                                .getElementById(
                                    "tierColourInput"
                                )
                                .value;



                            save();

                            render();



                        }


                    );


                }


            },








            {


                label:
                "Delete Tier",



                action:
                function(){


                    openModal(

                        "Delete Tier",



                        `

                        <p>
                        Delete this tier?
                        Movies will return to Movie Bank.
                        </p>

                        `,


                        "Delete",



                        function(){


                            data.movies.forEach(
                                movie=>{


                                    if(
                                        movie.tier === tier.id
                                    ){

                                        movie.tier =
                                            null;


                                        movie.order =
                                            0;

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

/* ==================================
   MOVIE SYSTEM
================================== */


function createMovie(movie){


    const card =
        document.createElement("div");



    card.className =
        "movie-card";



    card.draggable =
        true;



    card.dataset.movie =
        movie.id;





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
    ){

        card.classList.add(
            "poster-only"
        );

    }





    setupMovieDragging(
        card,
        movie
    );






    const menuButton =
        card.querySelector(
            ".movie-menu"
        );



    menuButton.onclick =
    function(event){


        event.stopPropagation();



        openMovieMenu(
            movie,
            this
        );


    };



    return card;


}









/* ==================================
   MOVIE DRAGGING
================================== */


let draggedMovie = null;





function setupMovieDragging(
    element,
    movie
){


    element.addEventListener(
        "dragstart",
        function(event){


            draggedMovie =
                movie;



            element.classList.add(
                "dragging"
            );



            event.dataTransfer.effectAllowed =
                "move";


        }
    );






    element.addEventListener(
        "dragend",
        function(){


            element.classList.remove(
                "dragging"
            );



            draggedMovie =
                null;


        }
    );






    element.addEventListener(
        "dragover",
        function(event){


            if(draggedMovie){

                event.preventDefault();

            }


        }
    );






    element.addEventListener(
        "drop",
        function(event){


            event.preventDefault();



            if(
                !draggedMovie ||
                draggedMovie.id === movie.id
            ){

                return;

            }





            moveMovie(
                draggedMovie,
                movie
            );


        }
    );


}









/* ==================================
   MOVIE ORDER NORMALISATION
================================== */


function normaliseMovieOrders(){


    data.tiers.forEach(
        tier=>{


            const movies =
                data.movies
                .filter(
                    movie =>
                    movie.tier === tier.id
                )
                .sort(
                    (a,b)=>
                    a.order - b.order
                );




            movies.forEach(
                (movie,index)=>{


                    movie.order =
                        index;


                }
            );


        }
    );





    const bankMovies =
        data.movies
        .filter(
            movie =>
            movie.tier === null
        )
        .sort(
            (a,b)=>
            a.order - b.order
        );



    bankMovies.forEach(
        (movie,index)=>{


            movie.order =
                index;


        }
    );


}









/* ==================================
   MOVE MOVIE
================================== */


function moveMovie(
    movingMovie,
    targetMovie
){


    const targetTier =
        targetMovie.tier;





    movingMovie.tier =
        targetTier;






    const moviesInTier =
        data.movies
        .filter(
            movie =>
            movie.tier === targetTier &&
            movie.id !== movingMovie.id
        );





    const targetIndex =
        moviesInTier.findIndex(
            movie =>
            movie.id === targetMovie.id
        );






    moviesInTier.splice(
        targetIndex,
        0,
        movingMovie
    );






    moviesInTier.forEach(
        (movie,index)=>{


            movie.order =
                index;


        }
    );






    normaliseMovieOrders();


    save();

    render();


}









/* ==================================
   MOVIE DROP ZONES
================================== */


function setupDropZone(
    area,
    tierID
){



    area.addEventListener(
        "dragover",
        function(event){


            if(draggedMovie){

                event.preventDefault();

            }


        }
    );







    area.addEventListener(
        "drop",
        function(event){


            event.preventDefault();





            if(!draggedMovie){

                return;

            }





            draggedMovie.tier =
                tierID;






            const tierMovies =
                data.movies
                .filter(
                    movie =>
                    movie.tier === tierID &&
                    movie.id !== draggedMovie.id
                );






            draggedMovie.order =
                tierMovies.length;






            normaliseMovieOrders();


            save();

            render();


        }
    );


}

/* ==================================
   MOVIE MENU
================================== */


function openMovieMenu(
    movie,
    button
){


    showMenu(

        button,

        [


            {


                label:
                "Edit Movie",



                action:
                function(){


                    openModal(

                        "Edit Movie",


                        `

                        <input
                        id="movieNameInput"
                        value="${movie.title}">

                        `,


                        "Save",



                        function(){


                            const name =
                                document
                                .getElementById(
                                    "movieNameInput"
                                )
                                .value
                                .trim();





                            if(name){


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


                label:
                "Move To Movie Bank",



                action:
                function(){


                    movie.tier =
                        null;



                    movie.order =
                        0;



                    normaliseMovieOrders();


                    save();

                    render();


                }


            },








            {


                label:
                "Delete Movie",



                action:
                function(){


                    openModal(

                        "Delete Movie",


                        `

                        <p>
                        Delete ${movie.title}?
                        </p>

                        `,


                        "Delete",



                        function(){



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









/* ==================================
   RENDER SYSTEM
================================== */


function render(){


    tierContainer.innerHTML =
        "";



    movieBank.innerHTML =
        "";






    [...data.tiers]
        .sort(
            (a,b)=>
            a.order - b.order
        )
        .forEach(
            createTier
        );







    const sortedMovies =
        [...data.movies]
        .sort(
            (a,b)=>
            a.order - b.order
        );






    sortedMovies.forEach(
        movie=>{


            let location;





            if(movie.tier !== null){


                location =
                    document.querySelector(
                        `[data-tier="${movie.tier}"] .movies`
                    );


            }
            else{


                location =
                    movieBank;


            }






            if(location){


                location.appendChild(
                    createMovie(movie)
                );


            }


        }
    );


}









/* ==================================
   ADD SINGLE MOVIE
================================== */


addMovieButton.onclick =
function(){


    openModal(

        "Add Movie",


        `

        <input
        id="movieNameInput"
        placeholder="Movie name">

        `,


        "Add",



        function(){


            const title =
                document
                .getElementById(
                    "movieNameInput"
                )
                .value
                .trim();





            if(!title){

                return;

            }





            data.movies.push({

                id:
                    Date.now(),


                title:
                    title,


                tier:
                    null,


                order:
                    data.movies.length


            });






            save();

            render();


        }


    );


};









/* ==================================
   ADD MULTIPLE MOVIES
================================== */


addMultipleMoviesButton.onclick =
function(){


    openModal(

        "Add Multiple Movies",


        `

        <textarea
        id="multipleMovieInput"
        placeholder="Enter movie names separated by commas or new lines"></textarea>

        `,


        "Add Movies",



        function(){


            const text =
                document
                .getElementById(
                    "multipleMovieInput"
                )
                .value;





            const titles =
                text
                .split(
                    /[\n,]+/
                )
                .map(
                    title =>
                    title.trim()
                )
                .filter(
                    title =>
                    title.length
                );






            titles.forEach(
                title=>{


                    data.movies.push({

                        id:
                            Date.now() +
                            Math.random(),


                        title:
                            title,


                        tier:
                            null,


                        order:
                            data.movies.length


                    });


                }
            );






            save();

            render();


        }


    );


};









/* ==================================
   ADD TIER
================================== */


addTierButton.onclick =
function(){


    openModal(

        "Add Tier",


        `

        <input
        id="tierNameInput"
        placeholder="Tier name">


        <br><br>


        <input
        type="color"
        id="tierColourInput"
        value="#6b7280">

        `,


        "Add Tier",



        function(){


            const name =
                document
                .getElementById(
                    "tierNameInput"
                )
                .value
                .trim();





            const colour =
                document
                .getElementById(
                    "tierColourInput"
                )
                .value;






            if(!name){

                return;

            }







            data.tiers.push({

                id:
                    Date.now(),


                name:
                    name,


                colour:
                    colour,


                order:
                    data.tiers.length


            });






            save();

            render();


        }


    );


};









/* ==================================
   SETTINGS
================================== */


settingsButton.onclick =
function(){


    settingsPanel.classList.toggle(
        "hidden"
    );


};






document
.querySelectorAll(
    'input[name="cardStyle"]'
)
.forEach(
    option=>{


        option.checked =
            option.value ===
            data.settings.cardStyle;





        option.onchange =
        function(){


            data.settings.cardStyle =
                option.value;





            save();

            render();


        };


    }
);









/* ==================================
   FINAL START
================================== */


normaliseMovieOrders();

save();

render();
