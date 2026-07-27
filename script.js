const addButton = document.getElementById("addMovie");
const addTierButton = document.getElementById("addTier");

const tierContainer = document.getElementById("tierContainer");
const movieBank = document.getElementById("movieBank");


let data = JSON.parse(localStorage.getItem("movieClub")) || {

    tiers: [

        {id:1,name:"S",emoji:"⭐",colour:"s",order:0},
        {id:2,name:"A",emoji:"🔥",colour:"a",order:1},
        {id:3,name:"B",emoji:"👍",colour:"b",order:2},
        {id:4,name:"C",emoji:"🙂",colour:"c",order:3},
        {id:5,name:"D",emoji:"😐",colour:"d",order:4},
        {id:6,name:"F",emoji:"💀",colour:"f",order:5}

    ],

    movies: []

};



function save(){

    localStorage.setItem(
        "movieClub",
        JSON.stringify(data)
    );

}




function createTier(tier){


    const section =
        document.createElement("section");


    section.className =
        `tier ${tier.colour}`;


    section.innerHTML = `

        <div class="tier-title">

            <h2>
                ${tier.name} ${tier.emoji}
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



    menu.onclick = () => {


        const choice =
        prompt(
`Tier options:

1 - Rename tier
2 - Change colour
3 - Delete tier`
        );



        if(choice==="1"){

            const name =
            prompt(
                "New tier name:",
                tier.name
            );


            if(name){

                tier.name=name;

                save();

                render();

            }

        }



        if(choice==="2"){


            const colour =
            prompt(
"Choose colour:

s = Red
a = Orange
b = Yellow
c = Green
d = Blue
f = Grey"
            );


            if(colour){

                tier.colour=colour;

                save();

                render();

            }

        }




        if(choice==="3"){


            const confirmDelete =
            confirm(
            "Delete this tier? Movies will return to Movie Bank."
            );


            if(confirmDelete){


                data.movies.forEach(movie=>{

                    if(movie.tier===tier.id){

                        movie.tier=null;

                    }

                });


                data.tiers =
                data.tiers.filter(
                    t=>t.id!==tier.id
                );


                save();

                render();

            }

        }


    };



    const area =
    section.querySelector(".movies");



    setupDrop(area,tier.id);



    tierContainer.appendChild(section);

}




function setupDrop(area,tierID){


    area.addEventListener(
        "dragover",
        e=>e.preventDefault()
    );



    area.addEventListener(
        "drop",
        e=>{


            const id =
            e.dataTransfer.getData("id");


            const movie =
            data.movies.find(
                m=>m.id==id
            );


            if(movie){

                movie.tier=tierID;

                save();

                render();

            }

        }
    );


}




function createMovie(movie){


    const card =
    document.createElement("div");


    card.className="movie-card";

    card.draggable=true;



    card.innerHTML=`

        <div class="poster">
            🎬
        </div>

        <div class="movie-title">
            ${movie.title}
        </div>

    `;



    card.addEventListener(
        "dragstart",
        e=>{

            e.dataTransfer.setData(
                "id",
                movie.id
            );

        }
    );



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


        let location;



        if(movie.tier){

            location =
            document.querySelector(
            `[data-tier="${movie.tier}"]`
            );

        }

        else{

            location=movieBank;

        }



        location.appendChild(
            createMovie(movie)
        );


    });


}




addButton.onclick=()=>{


    const title =
    prompt(
        "Movie name:"
    );


    if(!title)return;



    data.movies.push({

        id:Date.now(),

        title:title,

        tier:null,

        poster:""

    });


    save();

    render();

};





addTierButton.onclick=()=>{


    const name =
    prompt(
        "Tier name:"
    );


    if(!name)return;



    data.tiers.push({

        id:Date.now(),

        name:name,

        emoji:"🎬",

        colour:"c",

        order:data.tiers.length

    });



    save();

    render();

};




render();
