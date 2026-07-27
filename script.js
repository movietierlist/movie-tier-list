const addButton = document.getElementById("addMovie");

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


    section.className =
        `tier ${tier.colour}`;



    section.innerHTML = `

        <h2>
            ${tier.name} ${tier.emoji}
        </h2>


        <div 
        class="movies"
        data-tier="${tier.id}">
        </div>

    `;



    const area =
        section.querySelector(".movies");



    setupDropZone(area, tier.id);



    tierContainer.appendChild(section);


}





function setupDropZone(area, tierID) {


    area.addEventListener(
        "dragover",
        e => e.preventDefault()
    );



    area.addEventListener(
        "drop",
        e => {


            const id =
                e.dataTransfer.getData("id");



            const movie =
                data.movies.find(
                    m => m.id == id
                );



            if(movie){

                movie.tier = tierID;

                save();

                render();

            }


        }
    );


}




function createMovie(movie){


    const card =
        document.createElement("div");


    card.className =
        "movie-card";


    card.draggable = true;


    card.dataset.id =
        movie.id;



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

    `;




    card.addEventListener(
        "dragstart",
        e => {

            e.dataTransfer.setData(
                "id",
                movie.id
            );

        }
    );




    card.querySelector(
        ".menu-button"
    ).onclick = () => {


        const choice =
            prompt(
                "Type:\n1 = Edit\n2 = Delete"
            );


        if(choice === "1"){

            const name =
                prompt(
                    "Movie name:",
                    movie.title
                );


            if(name){

                movie.title=name;

                save();

                render();

            }

        }



        if(choice === "2"){


            data.movies =
                data.movies.filter(
                    m => m.id !== movie.id
                );


            save();

            render();

        }


    };



    return card;

}





function render(){


    tierContainer.innerHTML="";


    movieBank.innerHTML="";



    data.tiers
        .sort(
            (a,b)=>a.order-b.order
        )
        .forEach(createTier);




    data.movies.forEach(movie=>{


        let container;



        if(movie.tier){

            container =
            document.querySelector(
                `[data-tier="${movie.tier}"]`
            );

        }
        else{

            container =
            movieBank;

        }




        container.appendChild(
            createMovie(movie)
        );


    });


}





addButton.onclick = () => {


    const title =
        prompt(
            "Movie name:"
        );



    if(!title) return;



    data.movies.push({

        id:Date.now(),

        title:title,

        poster:"",

        tier:null,

        order:0

    });



    save();

    render();

};




render();
