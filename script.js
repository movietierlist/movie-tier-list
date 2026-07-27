const addMovieButton = document.getElementById("addMovie");
const addTierButton = document.getElementById("addTier");

const settingsButton = document.getElementById("settingsButton");
const settingsPanel = document.getElementById("settingsPanel");

const tierContainer = document.getElementById("tierContainer");
const movieBank = document.getElementById("movieBank");

let activeMenu = null;


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

// Device detection

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


    console.log("Device mode:", device);

}



detectDevice();



window.addEventListener(
    "resize",
    detectDevice
);



let data = JSON.parse(localStorage.getItem("movieClub")) || {


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





function save() {

    localStorage.setItem(
        "movieClub",
        JSON.stringify(data)
    );

}





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



    const menu =
        section.querySelector(".tier-menu");



menu.onclick = function(event) {

    event.stopPropagation();

    openTierMenu(
        tier,
        this
    );

};


    showMenu(

        button,

        [

            {
                label:"Rename Tier",

                action:function(){

                    const name =
                        prompt(
                            "Tier name:",
                            tier.name
                        );


                    if(name){

                        tier.name = name;

                        save();

                        render();

                    }

                }

            },


            {
                label:"Change Colour",

                action:function(){

                    const colour =
                        prompt(
                            "Colour code:",
                            tier.colour
                        );


                    if(colour){

                        tier.colour = colour;

                        save();

                        render();

                    }

                }

            },


            {
                label:"Delete Tier",

                action:function(){


                    if(confirm("Delete tier? Movies return to Movie Bank.")){


                        data.movies.forEach(movie=>{

                            if(movie.tier === tier.id){

                                movie.tier = null;

                            }

                        });



                        data.tiers =
                            data.tiers.filter(
                                t=>t.id !== tier.id
                            );


                        save();

                        render();


                    }

                }

            }

        ]

    );

}



    const movieArea =
        section.querySelector(".movies");



    setupDropZone(movieArea, tier.id);



    tierContainer.appendChild(section);

}





function openTierMenu(tier) {


    const choice = prompt(
        "1 - Rename tier\n" +
        "2 - Change colour\n" +
        "3 - Delete tier"
    );



    if(choice === "1") {


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




    if(choice === "2") {


        const colour =
            prompt(
                "Colour:\n\n" +
                "s = Red\n" +
                "a = Orange\n" +
                "b = Yellow\n" +
                "c = Green\n" +
                "d = Blue\n" +
                "f = Grey"
            );


        if(colour) {

            tier.colour = colour;

            save();

            render();

        }

    }




    if(choice === "3") {


        if(confirm("Delete tier? Movies return to Movie Bank.")) {


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



    const rect =
        button.getBoundingClientRect();



    menu.style.top =
        rect.bottom + window.scrollY + "px";


    menu.style.left =
        rect.left + window.scrollX - 100 + "px";



    activeMenu = menu;

}


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



    if(data.settings.cardStyle === "poster") {

        card.classList.add("poster-only");

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





   card.querySelector(".movie-menu")
.onclick = function(event) {


    event.stopPropagation();


    openMovieMenu(
        movie,
        this
    );


};


            event.stopPropagation();


            openMovieMenu(movie);

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


    const choice =
        prompt(
            "1 - Edit movie\n" +
            "2 - Delete movie"
        );



    if(choice === "1") {


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





    if(choice === "2") {


        data.movies =
            data.movies.filter(
                m => m.id !== movie.id
            );


        save();

        render();

    }

}






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





addMovieButton.onclick = function() {


    const title =
        prompt(
            "Movie name:"
        );



    if(!title) return;



    data.movies.push({

        id: Date.now(),

        title: title,

        tier: null,

        poster: ""

    });



    save();

    render();

};






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





render();
