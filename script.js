/* ==================================
   MOVIE TIER LIST APP
   Version 2.2 — Insertion-Gap Dragging

   CHANGELOG FROM 2.1
   - Fixed grab handle CSS class mismatch (see style.css)
   - Movies can now be dropped before, between, or after
     ANY movie in a row (previously "before" only)
   - Added a visible drag placeholder line
   - Movie Bank is now a real drop zone (drag back in)
================================== */


/* ==================================
   TMDB (THE MOVIE DATABASE) SETUP
   Get a free API key at themoviedb.org
   (Settings > API) and paste it below.
================================== */

const TMDB_API_KEY = "67e7ad777efc7a0cee0587954ddf8d54";


/* ==================================
   DOM REFERENCES
================================== */

const addMovieButton = document.getElementById("addMovie");
const addTextPosterMovieButton = document.getElementById("addTextPosterMovie");
const addMultipleMoviesButton = document.getElementById("addMultipleMovies");
const addTierButton = document.getElementById("addTier");
const deleteMoviesButton = document.getElementById("deleteMovies");
const settingsButton = document.getElementById("settingsButton");
const settingsPanel = document.getElementById("settingsPanel");
const aboutButton = document.getElementById("aboutButton");
const aboutPanel = document.getElementById("aboutPanel");
const tierContainer = document.getElementById("tierContainer");
const movieBank = document.getElementById("movieBank");

const appTitle = document.getElementById("appTitle");
const homeView = document.getElementById("homeView");
const appView = document.getElementById("appView");
const homeButton = document.getElementById("homeButton");
const newListButton = document.getElementById("newListButton");
const listGrid = document.getElementById("listGrid");
const exportListsButton = document.getElementById("exportListsButton");
const importListsButton = document.getElementById("importListsButton");
const importFileInput = document.getElementById("importFileInput");
const tournamentGrid = document.getElementById("tournamentGrid");
const newTournamentButton = document.getElementById("newTournamentButton");
const tournamentPlayView = document.getElementById("tournamentPlayView");


/* ==================================
   MODAL SYSTEM
================================== */

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

    const input = modalContent.querySelector("input, textarea");

    if (input) {
        setTimeout(() => input.focus(), 50);
    }
}

function closeModal() {
    modalOverlay.classList.add("hidden");
    modalContent.innerHTML = "";
    modalAction = null;
}

modalCancel.onclick = function () {
    closeModal();
};

modalConfirm.onclick = function () {

    const actionToRun = modalAction;

    if (actionToRun) {
        actionToRun();
    }

    // If the action opened a NEW modal (common when one step leads
    // into another, like Tournament setup), modalAction now points
    // at that new step's callback instead of the one we just ran —
    // in that case, leave the new modal open instead of closing it.
    if (modalAction === actionToRun) {
        closeModal();
    }
};

document.addEventListener("keydown", function (event) {

    if (modalOverlay.classList.contains("hidden")) {
        return;
    }

    if (event.key === "Escape") {
        closeModal();
    }

    if (event.key === "Enter" && event.target.tagName !== "TEXTAREA") {
        modalConfirm.click();
    }
});


/* ==================================
   CONTEXT MENU SYSTEM
================================== */

let activeMenu = null;

function closeMenus() {
    if (activeMenu) {
        activeMenu.remove();
        activeMenu = null;
    }
}

document.addEventListener("click", function (event) {

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

        option.onclick = function (event) {
            event.stopPropagation();
            closeMenus();
            item.action();
        };

        menu.appendChild(option);
    });

    // Append it hidden first so we can measure its real size
    // before deciding where it should actually go.
    menu.style.visibility = "hidden";
    document.body.appendChild(menu);

    positionMenu(menu, button);

    menu.style.visibility = "visible";

    activeMenu = menu;
}


/* ==================================
   SMART MENU POSITIONING
   Flips the menu above/below and left/right of whatever
   button opened it, based on available screen space, so
   it never runs off the edge of the viewport — on any
   device or screen size.
================================== */

function positionMenu(menu, button) {

    const EDGE_MARGIN = 8;

    const buttonRect = button.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Horizontal: prefer lining up with the button's left edge,
    // but flip to the button's right edge if that would overflow.
    let left = buttonRect.left;

    if (left + menuRect.width > viewportWidth - EDGE_MARGIN) {
        left = buttonRect.right - menuRect.width;
    }

    if (left < EDGE_MARGIN) {
        left = EDGE_MARGIN;
    }

    // Vertical: prefer opening below the button,
    // but flip to open above it if there's no room below.
    let top = buttonRect.bottom;

    if (top + menuRect.height > viewportHeight - EDGE_MARGIN) {
        top = buttonRect.top - menuRect.height;
    }

    if (top < EDGE_MARGIN) {
        top = EDGE_MARGIN;
    }

    menu.style.left = (left + window.scrollX) + "px";
    menu.style.top = (top + window.scrollY) + "px";
}


/* ==================================
   MULTI-LIST STORAGE
   Everything now lives under named "tier lists" instead of
   a single save. `data` always points at whichever list is
   currently open — every other function in this file still
   just reads/writes data.tiers, data.movies, etc. exactly
   like before, so none of that code needed to change.
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

function getDefaultListData() {

    return {
        settings: {
            cardStyle: "title"
        },

        tiers: [
            { id: 1, name: "S", colour: "#ef4444", order: 0 },
            { id: 2, name: "A", colour: "#f97316", order: 1 },
            { id: 3, name: "B", colour: "#eab308", order: 2 },
            { id: 4, name: "C", colour: "#22c55e", order: 3 },
            { id: 5, name: "D", colour: "#3b82f6", order: 4 },
            { id: 6, name: "F", colour: "#6b7280", order: 5 }
        ],

        movies: []
    };
}

function loadAppStore() {

    const stored = JSON.parse(localStorage.getItem("movieTierListApp"));

    if (stored && stored.lists) {
        return stored;
    }

    // Migrate an older single-list save if one exists, so nothing
    // from before this update gets lost.
    const legacy = JSON.parse(localStorage.getItem("movieClub"));

    if (legacy) {

        const migratedList = {
            id: Date.now() + Math.random(),
            name: "My Tier List",
            type: "movie",
            data: legacy
        };

        return {
            activeListId: migratedList.id,
            lists: [migratedList]
        };
    }

    return {
        activeListId: null,
        lists: []
    };
}

let appStore = loadAppStore();
let data = null;
let activeListType = "movie";

if (!appStore.tournaments) {
    appStore.tournaments = [];
}

if (!appStore.settings) {
    appStore.settings = { bracketViewMode: "single", treeDisplayMode: "text" };
}

function saveAppStore() {
    localStorage.setItem("movieTierListApp", JSON.stringify(appStore));
}

function save() {
    saveAppStore();
}


/* ==================================
   DATA CLEANUP
================================== */

function cleanupData() {

    if (!data.settings) {
        data.settings = { cardStyle: "title" };
    }

    if (!data.tiers) {
        data.tiers = [];
    }

    if (!data.movies) {
        data.movies = [];
    }

    data.tiers.forEach((tier, index) => {

        if (tier.order === undefined) {
            tier.order = index;
        }

        if (!tier.colour) {
            tier.colour = "#6b7280";
        }
    });

    data.movies.forEach(movie => {

        if (movie.order === undefined) {
            movie.order = 0;
        }

        if (movie.tier === undefined) {
            movie.tier = null;
        }
    });

    save();
}


/* ==================================
   LIST TYPE WORDING
   Movie lists use TMDb lookups and "movie" wording. General
   lists skip TMDb entirely — everything is a text poster —
   and every button/label swaps to "item" wording instead.
================================== */

function noun(movieWord, itemWord) {
    return activeListType === "general" ? itemWord || "items" : movieWord || "movies";
}

function applyListTypeUI() {

    const isGeneral = activeListType === "general";

    addMovieButton.textContent = isGeneral ? "+ Add Item" : "+ Add";
    deleteMoviesButton.textContent = isGeneral ? "🗑 Delete Items" : "🗑 Delete Movies";

    addTextPosterMovieButton.classList.toggle("hidden", isGeneral);
}


/* ==================================
   LIST SWITCHING
   Handles moving between the home screen (picking/creating
   a list) and the app screen (editing whichever list is
   currently open).
================================== */

function openList(listId) {

    const list = appStore.lists.find(l => l.id === listId);

    if (!list) {
        return;
    }

    appStore.activeListId = listId;
    data = list.data;
    activeListType = list.type || "movie";

    cleanupData();
    saveAppStore();

    const typeIcon = activeListType === "general" ? "📝" : "🎬";
    appTitle.textContent = typeIcon + " " + list.name;

    applyListTypeUI();

    homeView.classList.add("hidden");
    tournamentPlayView.classList.add("hidden");
    appView.classList.remove("hidden");

    normaliseMovieOrders();
    render();
}

function goHome() {

    homeView.classList.remove("hidden");
    appView.classList.add("hidden");
    tournamentPlayView.classList.add("hidden");

    renderHome();
}

function createNewList(name, type) {

    const newList = {
        id: Date.now() + Math.random(),
        name: name,
        type: type || "movie",
        data: getDefaultListData()
    };

    appStore.lists.push(newList);
    saveAppStore();

    openList(newList.id);
}

function renameList(listId, newName) {

    const list = appStore.lists.find(l => l.id === listId);

    if (!list) {
        return;
    }

    list.name = newName;
    saveAppStore();

    if (appStore.activeListId === listId) {
        appTitle.textContent = "🎬 " + newName;
    }

    renderHome();
}

function deleteList(listId) {

    appStore.lists = appStore.lists.filter(l => l.id !== listId);

    if (appStore.activeListId === listId) {
        appStore.activeListId = null;
        data = null;
    }

    saveAppStore();
    renderHome();
}


/* ==================================
   HOME SCREEN
================================== */

function renderHome() {

    listGrid.innerHTML = "";

    if (appStore.lists.length === 0) {
        listGrid.innerHTML = `<p class="empty-home-message">You don't have any tier lists yet — create one to get started.</p>`;
    } else {

        appStore.lists.forEach(list => {

            const itemCount = list.data.movies ? list.data.movies.length : 0;
            const isGeneral = list.type === "general";
            const typeLabel = isGeneral ? "📝 General List" : "🎬 Movie List";
            const itemNoun = isGeneral ? "item" : "movie";

            const card = document.createElement("div");
            card.className = "list-card";

            card.innerHTML = `
                <button class="list-card-menu">⋮</button>
                <h3>${list.name}</h3>
                <p>${typeLabel} · ${itemCount} ${itemNoun}${itemCount === 1 ? "" : "s"}</p>
            `;

            card.onclick = function (event) {

                if (event.target.closest(".list-card-menu")) {
                    return;
                }

                openList(list.id);
            };

            const menuButton = card.querySelector(".list-card-menu");

            menuButton.onclick = function (event) {
                event.stopPropagation();
                openListMenu(list, this);
            };

            listGrid.appendChild(card);
        });
    }

    renderTournamentsHome();
}

function openListMenu(list, button) {

    showMenu(button, [

        {
            label: "Rename",
            action: function () {

                openModal(
                    "Rename Tier List",
                    `<input id="listNameInput" value="${list.name}">`,
                    "Save",
                    function () {

                        const name = document.getElementById("listNameInput").value.trim();

                        if (name) {
                            renameList(list.id, name);
                        }
                    }
                );
            }
        },

        {
            label: "Delete",
            action: function () {

                openModal(
                    "Delete Tier List",
                    `<p>Delete "${list.name}"? This can't be undone.</p>`,
                    "Delete",
                    function () {
                        deleteList(list.id);
                    }
                );
            }
        }

    ]);
}


/* ==================================
   TOURNAMENT HELPERS
================================== */

function nextPowerOfTwo(n) {

    let power = 1;

    while (power < n) {
        power *= 2;
    }

    return Math.max(power, 2);
}

function shuffleArray(array) {

    const copy = [...array];

    for (let i = copy.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));
        const temp = copy[i];

        copy[i] = copy[j];
        copy[j] = temp;
    }

    return copy;
}

function findParticipant(tournament, id) {
    return tournament.participants.find(p => p.id === id);
}

function undoButtonHTML(tournament) {

    const isDisabled = !tournament.history || tournament.history.length === 0;

    return `<button id="tournamentUndoButton" class="tournament-undo" ${isDisabled ? "disabled" : ""}>↩ Undo</button>`;
}

function renderParticipantPoster(participant) {

    if (participant.poster) {
        return `<div class="poster"><img src="${participant.poster}" alt="${participant.title} poster" draggable="false"></div>`;
    }

    if (participant.textPoster) {

        const colorStyle = participant.posterColor ? ` style="background:${participant.posterColor}"` : "";

        return `<div class="poster"><div class="text-poster"${colorStyle}>${participant.title}</div></div>`;
    }

    return `<div class="poster">🎬</div>`;
}

function renderTreeSlotContent(participant) {

    const mode = appStore.settings.treeDisplayMode || "text";

    if (mode === "poster") {
        return renderParticipantPoster(participant);
    }

    if (mode === "both") {
        return renderParticipantPoster(participant) + `<span class="tree-slot-title">${participant.title}</span>`;
    }

    return `<span class="tree-slot-title">${participant.title}</span>`;
}

function buildFirstRound(participants, byeIds) {

    const byeSet = new Set(byeIds);
    const byeParticipants = participants.filter(p => byeSet.has(p.id));
    const playing = shuffleArray(participants.filter(p => !byeSet.has(p.id)));

    const matches = [];

    for (let i = 0; i < playing.length; i += 2) {

        matches.push({
            a: playing[i].id,
            b: playing[i + 1].id,
            winner: null
        });
    }

    byeParticipants.forEach(participant => {
        matches.push({ a: participant.id, b: null, winner: participant.id });
    });

    return shuffleArray(matches);
}

function buildNextRound(previousRoundMatches) {

    const winners = previousRoundMatches.map(m => m.winner);
    const matches = [];

    for (let i = 0; i < winners.length; i += 2) {
        matches.push({ a: winners[i], b: winners[i + 1], winner: null });
    }

    return matches;
}


/* ==================================
   TOURNAMENT CREATION
================================== */

function openNewTournamentFlow() {

    let selectedSource = "existing";

    openModal(
        "New Tournament",
        `
        <input id="tournamentNameInput" placeholder="e.g. Best Movie Ever">
        <div class="type-toggle">
            <button type="button" id="sourceExistingBtn" class="type-toggle-option selected">From A List</button>
            <button type="button" id="sourceFreshBtn" class="type-toggle-option">Enter Fresh</button>
        </div>
        `,
        "Next",
        function () {

            const name = document.getElementById("tournamentNameInput").value.trim();

            if (!name) {
                return;
            }

            if (selectedSource === "existing") {
                openTournamentSourceListPicker(name);
            } else {
                openTournamentFreshEntry(name);
            }
        }
    );

    const existingBtn = document.getElementById("sourceExistingBtn");
    const freshBtn = document.getElementById("sourceFreshBtn");

    existingBtn.onclick = function () {
        selectedSource = "existing";
        existingBtn.classList.add("selected");
        freshBtn.classList.remove("selected");
    };

    freshBtn.onclick = function () {
        selectedSource = "fresh";
        freshBtn.classList.add("selected");
        existingBtn.classList.remove("selected");
    };
}

function openTournamentSourceListPicker(name) {

    if (appStore.lists.length === 0) {

        openModal(
            "No Tier Lists",
            `<p>You don't have any tier lists to pull from yet. Try "Enter Fresh" instead.</p>`,
            "OK",
            function () {}
        );

        return;
    }

    openModal(
        "Choose A List",
        `<div id="pickListContainer" class="pick-list"></div>`,
        "Close",
        function () {}
    );

    const container = document.getElementById("pickListContainer");

    appStore.lists.forEach(list => {

        const row = document.createElement("button");
        row.type = "button";
        row.className = "pick-row";
        row.textContent = list.name;

        row.onclick = function () {
            closeModal();
            proceedWithParticipantsFromList(name, list);
        };

        container.appendChild(row);
    });
}

function proceedWithParticipantsFromList(name, list) {

    const participants = (list.data.movies || []).map(movie => ({
        id: Date.now() + Math.random(),
        title: movie.title,
        poster: movie.poster || null,
        textPoster: movie.textPoster || false,
        posterColor: movie.posterColor || null
    }));

    if (participants.length < 2) {

        openModal(
            "Not Enough Items",
            `<p>"${list.name}" needs at least 2 items to run a tournament.</p>`,
            "OK",
            function () {}
        );

        return;
    }

    beginTournamentSetup(name, participants);
}

function openTournamentFreshEntry(name) {

    let selectedType = "movie";

    openModal(
        "Enter Participants",
        `
        <div class="type-toggle">
            <button type="button" id="freshTypeMovieBtn" class="type-toggle-option selected">🎬 Movie/TV</button>
            <button type="button" id="freshTypeGeneralBtn" class="type-toggle-option">📝 Text Only</button>
        </div>
        <textarea id="tournamentParticipantsInput" placeholder="Enter names separated by commas or new lines"></textarea>
        <label class="color-picker-label">
            Background Colour (Text Only)
            <input type="color" id="posterColorInput" value="#2563eb">
        </label>
        `,
        "Next",
        function () {

            const text = document.getElementById("tournamentParticipantsInput").value;
            const posterColor = document.getElementById("posterColorInput").value;

            const titles = text
                .split(/[\n,]+/)
                .map(t => t.trim())
                .filter(t => t.length);

            if (titles.length < 2) {

                openModal(
                    "Not Enough Participants",
                    `<p>Enter at least 2 names to run a tournament.</p>`,
                    "OK",
                    function () {}
                );

                return;
            }

            const participants = titles.map(title => ({
                id: Date.now() + Math.random(),
                title: title,
                poster: null,
                textPoster: selectedType === "general",
                posterColor: selectedType === "general" ? posterColor : null
            }));

            beginTournamentSetup(name, participants);

            if (selectedType === "movie") {
                fetchPostersWithThrottle(participants, attachTournamentPoster);
            }
        }
    );

    const movieBtn = document.getElementById("freshTypeMovieBtn");
    const generalBtn = document.getElementById("freshTypeGeneralBtn");

    movieBtn.onclick = function () {
        selectedType = "movie";
        movieBtn.classList.add("selected");
        generalBtn.classList.remove("selected");
    };

    generalBtn.onclick = function () {
        selectedType = "general";
        generalBtn.classList.add("selected");
        movieBtn.classList.remove("selected");
    };
}

async function attachTournamentPoster(participant) {

    const posterUrl = await fetchPosterUrl(participant.title);

    if (posterUrl) {
        participant.poster = posterUrl;
        saveAppStore();
    }
}

function beginTournamentSetup(name, participants) {

    const bracketSize = nextPowerOfTwo(participants.length);
    const byesNeeded = bracketSize - participants.length;

    if (byesNeeded === 0) {
        finalizeNewTournament(name, participants, []);
        return;
    }

    openByeSelectionModal(name, participants, byesNeeded);
}

function openByeSelectionModal(name, participants, byesNeeded) {

    openModal(
        "Choose Byes",
        `
        <p class="bye-instructions">Your bracket needs ${byesNeeded} bye${byesNeeded === 1 ? "" : "s"} — pick exactly ${byesNeeded} to automatically skip Round 1.</p>
        <div id="byeCheckboxList" class="delete-movie-list"></div>
        `,
        "Start Tournament",
        function () {

            const checked = modalContent.querySelectorAll(".byeCheckbox:checked");

            if (checked.length !== byesNeeded) {
                return;
            }

            const byeIds = Array.from(checked).map(box => Number(box.dataset.participantId));

            finalizeNewTournament(name, participants, byeIds);
        }
    );

    const listContainer = document.getElementById("byeCheckboxList");

    participants.forEach(participant => {

        const row = document.createElement("label");
        row.className = "delete-movie-row";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "byeCheckbox";
        checkbox.dataset.participantId = participant.id;

        checkbox.onchange = function () {

            const checkedCount = listContainer.querySelectorAll(".byeCheckbox:checked").length;
            const allCheckboxes = listContainer.querySelectorAll(".byeCheckbox");

            allCheckboxes.forEach(box => {
                if (!box.checked) {
                    box.disabled = checkedCount >= byesNeeded;
                }
            });
        };

        row.appendChild(checkbox);
        row.appendChild(document.createTextNode(participant.title));

        listContainer.appendChild(row);
    });
}

function finalizeNewTournament(name, participants, byeIds) {

    const tournament = {
        id: Date.now() + Math.random(),
        name: name,
        participants: participants,
        matches: [],
        currentRound: 0,
        currentMatch: 0,
        status: "active",
        winnerId: null,
        history: []
    };

    tournament.matches.push(buildFirstRound(participants, byeIds));

    appStore.tournaments.push(tournament);
    saveAppStore();

    openTournament(tournament.id);
}


/* ==================================
   TOURNAMENT PLAY
================================== */

function openTournament(id) {

    const tournament = appStore.tournaments.find(t => t.id === id);

    if (!tournament) {
        return;
    }

    homeView.classList.add("hidden");
    appView.classList.add("hidden");
    tournamentPlayView.classList.remove("hidden");

    renderTournamentPlay(tournament);
}

function advanceTournamentState(tournament) {

    while (true) {

        const roundMatches = tournament.matches[tournament.currentRound];
        const nextIndex = roundMatches.findIndex(m => !m.winner);

        if (nextIndex !== -1) {
            tournament.currentMatch = nextIndex;
            return { complete: false, roundMatches: roundMatches, matchIndex: nextIndex };
        }

        if (roundMatches.length === 1) {
            tournament.status = "complete";
            tournament.winnerId = roundMatches[0].winner;
            saveAppStore();
            return { complete: true };
        }

        tournament.matches.push(buildNextRound(roundMatches));
        tournament.currentRound++;
    }
}

function renderTournamentPlay(tournament) {

    const state = advanceTournamentState(tournament);

    if (state.complete) {
        renderTournamentComplete(tournament);
        return;
    }

    saveAppStore();

    const scrollY = window.scrollY;

    if (appStore.settings.bracketViewMode === "tree") {
        renderBracketTree(tournament);
    } else {
        renderSingleMatchup(tournament, state);
    }

    window.scrollTo(0, scrollY);
}

function wireTournamentHeaderButtons(tournament) {

    document.getElementById("tournamentExitButton").onclick = function () {
        goHome();
    };

    const undoButton = document.getElementById("tournamentUndoButton");

    if (undoButton) {
        undoButton.onclick = function () {
            undoLastPick(tournament);
        };
    }

    const singleBtn = document.getElementById("viewModeSingleBtn");
    const treeBtn = document.getElementById("viewModeTreeBtn");

    if (singleBtn && treeBtn) {

        singleBtn.onclick = function () {
            appStore.settings.bracketViewMode = "single";
            saveAppStore();
            renderTournamentPlay(tournament);
        };

        treeBtn.onclick = function () {
            appStore.settings.bracketViewMode = "tree";
            saveAppStore();
            renderTournamentPlay(tournament);
        };
    }
}

function renderSingleMatchup(tournament, state) {

    const match = state.roundMatches[state.matchIndex];

    const participantA = findParticipant(tournament, match.a);
    const participantB = findParticipant(tournament, match.b);

    const roundLabel = state.roundMatches.length === 1 ? "Final" : "Round of " + (state.roundMatches.length * 2);
    const isTreeMode = appStore.settings.bracketViewMode === "tree";

    tournamentPlayView.innerHTML = `
        <div class="tournament-header">
            <button id="tournamentExitButton" class="tournament-exit">🏠 Home</button>
            ${undoButtonHTML(tournament)}
            <h2>${tournament.name}</h2>
            <p>${roundLabel} — Match ${state.matchIndex + 1} of ${state.roundMatches.length}</p>
            <div class="type-toggle view-mode-toggle">
                <button type="button" id="viewModeSingleBtn" class="type-toggle-option ${isTreeMode ? "" : "selected"}">🎯 Single Match</button>
                <button type="button" id="viewModeTreeBtn" class="type-toggle-option ${isTreeMode ? "selected" : ""}">🌳 Full Tree</button>
            </div>
        </div>
        <div class="matchup">
            <div class="matchup-card" data-pick="a">
                ${renderParticipantPoster(participantA)}
                <div class="matchup-title">${participantA.title}</div>
            </div>
            <div class="matchup-vs">VS</div>
            <div class="matchup-card" data-pick="b">
                ${renderParticipantPoster(participantB)}
                <div class="matchup-title">${participantB.title}</div>
            </div>
        </div>
    `;

    wireTournamentHeaderButtons(tournament);

    tournamentPlayView.querySelectorAll(".matchup-card").forEach(card => {

        card.onclick = function () {
            const pick = card.dataset.pick === "a" ? match.a : match.b;
            pickWinner(tournament, match, pick);
        };
    });
}

function renderBracketTree(tournament) {

    const previousTree = tournamentPlayView.querySelector(".bracket-tree");
    const previousScrollLeft = previousTree ? previousTree.scrollLeft : 0;
    const previousScrollTop = previousTree ? previousTree.scrollTop : 0;

    const bracketSize = tournament.matches[0].length * 2;
    const totalRounds = Math.log2(bracketSize);
    const isTreeMode = appStore.settings.bracketViewMode === "tree";

    let columnsHTML = "";

    for (let roundIndex = 0; roundIndex < totalRounds; roundIndex++) {

        const roundMatches = tournament.matches[roundIndex];
        const expectedMatchCount = bracketSize / Math.pow(2, roundIndex + 1);
        const roundLabel = expectedMatchCount === 1 ? "Final" : "Round of " + (expectedMatchCount * 2);

        let matchesHTML = "";

        for (let matchIndex = 0; matchIndex < expectedMatchCount; matchIndex++) {

            const match = roundMatches && roundMatches[matchIndex];

            if (!match) {

                matchesHTML += `
                    <div class="tree-match tree-match-tbd">
                        <div class="tree-slot">TBD</div>
                        <div class="tree-slot">TBD</div>
                    </div>
                `;

                continue;
            }

            const participantA = findParticipant(tournament, match.a);
            const participantB = match.b ? findParticipant(tournament, match.b) : null;
            const isDecided = !!match.winner;
            const isClickable = !isDecided && participantB;

            const slotClass = (participant, id) => {
                if (!isDecided) return "";
                return match.winner === id ? "tree-slot-winner" : "tree-slot-loser";
            };

            matchesHTML += `
                <div class="tree-match ${isClickable ? "tree-match-active" : ""}" data-round="${roundIndex}" data-match="${matchIndex}">
                    <div class="tree-slot ${slotClass(participantA, match.a)}" data-pick="a">${renderTreeSlotContent(participantA)}</div>
                    <div class="tree-slot ${participantB ? slotClass(participantB, match.b) : ""}" data-pick="b">${participantB ? renderTreeSlotContent(participantB) : "(bye)"}</div>
                </div>
            `;
        }

        columnsHTML += `
            <div class="tree-round">
                <div class="tree-round-label">${roundLabel}</div>
                <div class="tree-round-matches">${matchesHTML}</div>
            </div>
        `;
    }

    const treeDisplayMode = appStore.settings.treeDisplayMode || "text";

    tournamentPlayView.innerHTML = `
        <div class="tournament-header">
            <button id="tournamentExitButton" class="tournament-exit">🏠 Home</button>
            ${undoButtonHTML(tournament)}
            <h2>${tournament.name}</h2>
            <div class="type-toggle view-mode-toggle">
                <button type="button" id="viewModeSingleBtn" class="type-toggle-option ${isTreeMode ? "" : "selected"}">🎯 Single Match</button>
                <button type="button" id="viewModeTreeBtn" class="type-toggle-option ${isTreeMode ? "selected" : ""}">🌳 Full Tree</button>
            </div>
            <div class="type-toggle display-mode-toggle">
                <button type="button" id="displayTextBtn" class="type-toggle-option ${treeDisplayMode === "text" ? "selected" : ""}">🔤 Text Only</button>
                <button type="button" id="displayBothBtn" class="type-toggle-option ${treeDisplayMode === "both" ? "selected" : ""}">🖼️ Text + Poster</button>
                <button type="button" id="displayPosterBtn" class="type-toggle-option ${treeDisplayMode === "poster" ? "selected" : ""}">🎬 Poster Only</button>
            </div>
        </div>
        <div class="bracket-tree">${columnsHTML}</div>
    `;

    const newTree = tournamentPlayView.querySelector(".bracket-tree");
    newTree.scrollLeft = previousScrollLeft;
    newTree.scrollTop = previousScrollTop;

    wireTournamentHeaderButtons(tournament);

    document.getElementById("displayTextBtn").onclick = function () {
        appStore.settings.treeDisplayMode = "text";
        saveAppStore();
        renderTournamentPlay(tournament);
    };

    document.getElementById("displayBothBtn").onclick = function () {
        appStore.settings.treeDisplayMode = "both";
        saveAppStore();
        renderTournamentPlay(tournament);
    };

    document.getElementById("displayPosterBtn").onclick = function () {
        appStore.settings.treeDisplayMode = "poster";
        saveAppStore();
        renderTournamentPlay(tournament);
    };

    tournamentPlayView.querySelectorAll(".tree-match-active").forEach(matchEl => {

        matchEl.querySelectorAll(".tree-slot").forEach(slotEl => {

            slotEl.onclick = function () {

                const roundIndex = Number(matchEl.dataset.round);
                const matchIndex = Number(matchEl.dataset.match);
                const match = tournament.matches[roundIndex][matchIndex];
                const pick = slotEl.dataset.pick === "a" ? match.a : match.b;

                pickWinner(tournament, match, pick);
            };
        });
    });
}

function pickWinner(tournament, match, winnerId) {

    if (!tournament.history) {
        tournament.history = [];
    }

    tournament.history.push({
        matches: JSON.parse(JSON.stringify(tournament.matches)),
        currentRound: tournament.currentRound,
        status: tournament.status,
        winnerId: tournament.winnerId
    });

    match.winner = winnerId;

    saveAppStore();
    renderTournamentPlay(tournament);
}

function undoLastPick(tournament) {

    if (!tournament.history || tournament.history.length === 0) {
        return;
    }

    const snapshot = tournament.history.pop();

    tournament.matches = snapshot.matches;
    tournament.currentRound = snapshot.currentRound;
    tournament.status = snapshot.status;
    tournament.winnerId = snapshot.winnerId;

    saveAppStore();
    renderTournamentPlay(tournament);
}

function renderTournamentComplete(tournament) {

    const winner = findParticipant(tournament, tournament.winnerId);

    tournamentPlayView.innerHTML = `
        <div class="tournament-header">
            <button id="tournamentExitButton" class="tournament-exit">🏠 Home</button>
            ${undoButtonHTML(tournament)}
            <h2>${tournament.name}</h2>
            <p>🏆 Winner!</p>
        </div>
        <div class="tournament-winner">
            ${renderParticipantPoster(winner)}
            <h3>${winner.title}</h3>
            <div class="tournament-winner-actions">
                <button id="addWinnerToListButton">Add To A Tier List</button>
                <button id="tournamentDoneButton">Done</button>
            </div>
        </div>
    `;

    wireTournamentHeaderButtons(tournament);

    document.getElementById("tournamentDoneButton").onclick = function () {
        goHome();
    };

    document.getElementById("addWinnerToListButton").onclick = function () {
        promptAddWinnerToList(winner);
    };
}

function promptAddWinnerToList(winner) {

    if (appStore.lists.length === 0) {

        openModal(
            "No Tier Lists",
            `<p>You don't have any tier lists to add this to yet.</p>`,
            "OK",
            function () {}
        );

        return;
    }

    openModal(
        "Add To Which List?",
        `<div id="winnerListPicker" class="pick-list"></div>`,
        "Close",
        function () {}
    );

    const container = document.getElementById("winnerListPicker");

    appStore.lists.forEach(list => {

        const row = document.createElement("button");
        row.type = "button";
        row.className = "pick-row";
        row.textContent = list.name;

        row.onclick = function () {
            closeModal();
            promptAddWinnerToTier(winner, list);
        };

        container.appendChild(row);
    });
}

function promptAddWinnerToTier(winner, list) {

    const tiers = [...(list.data.tiers || [])].sort((a, b) => a.order - b.order);

    if (tiers.length === 0) {

        openModal(
            "No Tiers",
            `<p>"${list.name}" doesn't have any tiers to add to.</p>`,
            "OK",
            function () {}
        );

        return;
    }

    openModal(
        "Add To Which Tier?",
        `<div id="winnerTierPicker" class="pick-list"></div>`,
        "Close",
        function () {}
    );

    const container = document.getElementById("winnerTierPicker");

    tiers.forEach(tier => {

        const row = document.createElement("button");
        row.type = "button";
        row.className = "pick-row";
        row.textContent = tier.name;
        row.style.background = tier.colour;

        row.onclick = function () {

            closeModal();

            if (!list.data.movies) {
                list.data.movies = [];
            }

            const newItem = {
                id: Date.now() + Math.random(),
                title: winner.title,
                tier: tier.id,
                order: list.data.movies.filter(m => m.tier === tier.id).length,
                poster: winner.poster || null,
                textPoster: winner.textPoster || false,
                posterColor: winner.posterColor || null
            };

            list.data.movies.push(newItem);
            saveAppStore();

            openModal(
                "Added!",
                `<p>${winner.title} was added to "${tier.name}" in "${list.name}".</p>`,
                "OK",
                function () {}
            );
        };

        container.appendChild(row);
    });
}


/* ==================================
   TOURNAMENTS HOME
================================== */

function renderTournamentsHome() {

    tournamentGrid.innerHTML = "";

    if (appStore.tournaments.length === 0) {
        tournamentGrid.innerHTML = `<p class="empty-home-message">No tournaments yet — start one to find your favorite.</p>`;
        return;
    }

    appStore.tournaments.forEach(tournament => {

        const card = document.createElement("div");
        card.className = "list-card";

        let statusLine;

        if (tournament.status === "complete") {

            const winner = findParticipant(tournament, tournament.winnerId);
            statusLine = "🏆 Winner: " + (winner ? winner.title : "—");

        } else {

            const roundMatches = tournament.matches[tournament.currentRound] || [];
            const roundLabel = roundMatches.length === 1 ? "Final" : "Round of " + (roundMatches.length * 2);
            statusLine = "In Progress — " + roundLabel;
        }

        card.innerHTML = `
            <button class="list-card-menu">⋮</button>
            <h3>${tournament.name}</h3>
            <p>${statusLine}</p>
        `;

        card.onclick = function (event) {

            if (event.target.closest(".list-card-menu")) {
                return;
            }

            openTournament(tournament.id);
        };

        const menuButton = card.querySelector(".list-card-menu");

        menuButton.onclick = function (event) {
            event.stopPropagation();
            openTournamentMenu(tournament, this);
        };

        tournamentGrid.appendChild(card);
    });
}

function openTournamentMenu(tournament, button) {

    showMenu(button, [

        {
            label: "Rename",
            action: function () {

                openModal(
                    "Rename Tournament",
                    `<input id="tournamentRenameInput" value="${tournament.name}">`,
                    "Save",
                    function () {

                        const name = document.getElementById("tournamentRenameInput").value.trim();

                        if (name) {
                            tournament.name = name;
                            saveAppStore();
                            renderTournamentsHome();
                        }
                    }
                );
            }
        },

        {
            label: "Delete",
            action: function () {

                openModal(
                    "Delete Tournament",
                    `<p>Delete "${tournament.name}"? This can't be undone.</p>`,
                    "Delete",
                    function () {

                        appStore.tournaments = appStore.tournaments.filter(t => t.id !== tournament.id);
                        saveAppStore();
                        renderTournamentsHome();
                    }
                );
            }
        }

    ]);
}

newTournamentButton.onclick = function () {
    openNewTournamentFlow();
};

homeButton.onclick = function () {
    goHome();
};

newListButton.onclick = function () {

    let selectedListType = "movie";

    openModal(
        "New Tier List",
        `
        <input id="listNameInput" placeholder="e.g. Best of 2026">
        <div class="type-toggle">
            <button type="button" id="listTypeMovieBtn" class="type-toggle-option selected">🎬 Movie List</button>
            <button type="button" id="listTypeGeneralBtn" class="type-toggle-option">📝 General List</button>
        </div>
        `,
        "Create",
        function () {

            const name = document.getElementById("listNameInput").value.trim();

            if (!name) {
                return;
            }

            createNewList(name, selectedListType);
        }
    );

    const movieTypeBtn = document.getElementById("listTypeMovieBtn");
    const generalTypeBtn = document.getElementById("listTypeGeneralBtn");

    movieTypeBtn.onclick = function () {
        selectedListType = "movie";
        movieTypeBtn.classList.add("selected");
        generalTypeBtn.classList.remove("selected");
    };

    generalTypeBtn.onclick = function () {
        selectedListType = "general";
        generalTypeBtn.classList.add("selected");
        movieTypeBtn.classList.remove("selected");
    };
};


/* ==================================
   EXPORT / IMPORT
   A manual way to move your tier lists between devices —
   Export downloads everything as a JSON file, Import reads
   one back in. Imported lists are always ADDED alongside
   whatever you already have (never overwritten), and each
   gets a fresh ID so importing the same file twice is safe.
================================== */

exportListsButton.onclick = function () {

    const exportPayload = {
        exportVersion: 1,
        exportedAt: new Date().toISOString(),
        lists: appStore.lists
    };

    const blob = new Blob(
        [JSON.stringify(exportPayload, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "movie-tier-lists-backup.json";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
};

importListsButton.onclick = function () {
    importFileInput.click();
};

importFileInput.onchange = function () {

    const file = importFileInput.files[0];

    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function () {

        importFileInput.value = "";

        let parsed;

        try {
            parsed = JSON.parse(reader.result);
        } catch (error) {

            openModal(
                "Import Failed",
                `<p>That file doesn't look like a valid tier list backup.</p>`,
                "OK",
                function () {}
            );

            return;
        }

        const importedLists = Array.isArray(parsed.lists) ? parsed.lists : null;

        if (!importedLists || importedLists.length === 0) {

            openModal(
                "Import Failed",
                `<p>No tier lists were found in that file.</p>`,
                "OK",
                function () {}
            );

            return;
        }

        importedLists.forEach(list => {

            appStore.lists.push({
                id: Date.now() + Math.random(),
                name: list.name || "Imported List",
                data: list.data || getDefaultListData()
            });
        });

        saveAppStore();
        renderHome();

        openModal(
            "Import Complete",
            `<p>Imported ${importedLists.length} tier list${importedLists.length === 1 ? "" : "s"}.</p>`,
            "OK",
            function () {}
        );
    };

    reader.readAsText(file);
};


/* ==================================
   TIER CREATION
================================== */

function createTier(tier) {

    const section = document.createElement("section");
    section.className = "tier";
    section.dataset.tier = tier.id;

    section.innerHTML = `
        <div class="tier-label" style="background:${tier.colour}">
            <button class="grab-handle" title="Drag to reorder tiers">⠿</button>
            <h2>${tier.name}</h2>
        </div>

        <div class="tier-content">
            <button class="tier-menu">⋮</button>
            <div class="movies" data-tier="${tier.id}"></div>
        </div>
    `;

    setupTierDragging(section, tier);

    const menuButton = section.querySelector(".tier-menu");

    menuButton.onclick = function (event) {
        event.stopPropagation();
        openTierMenu(tier, this);
    };

    tierContainer.appendChild(section);
}


/* ==================================
   SMOOTH REORDER ANIMATION
   Records where a set of elements are BEFORE a DOM change,
   makes the change, then animates them from their old spot
   to their new one — this is what makes other tiers/movies
   visibly "part ways" instead of instantly jumping.
================================== */

function animateShift(elements, domChange) {

    const startRects = new Map();

    elements.forEach(el => {
        startRects.set(el, el.getBoundingClientRect());
    });

    domChange();

    elements.forEach(el => {

        const start = startRects.get(el);
        const end = el.getBoundingClientRect();

        const deltaX = start.left - end.left;
        const deltaY = start.top - end.top;

        if (!deltaX && !deltaY) {
            return;
        }

        el.style.transition = "none";
        el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        // Force the browser to apply that jump before re-enabling
        // the transition, otherwise it would animate the jump too.
        void el.offsetWidth;

        el.style.transition = "transform 0.2s ease";
        el.style.transform = "";
    });
}


/* ==================================
   TIER DRAGGING SYSTEM
   Built on Pointer Events, which fire the same way for a
   mouse, trackpad, or a finger on a touchscreen — this is
   what makes it actually work on mobile. Only the grab
   handle starts a drag; clicking anywhere else on the tier
   does nothing.
================================== */

function setupTierDragging(section, tier) {

    const grabHandle = section.querySelector(".grab-handle");

    grabHandle.addEventListener("pointerdown", function (event) {

        if (event.button !== undefined && event.button !== 0) {
            return;
        }

        startTierDrag(event, section, tier);
    });
}

function startTierDrag(startEvent, section, tier) {

    const pointerId = startEvent.pointerId;
    const startX = startEvent.clientX;
    const startY = startEvent.clientY;

    const DRAG_THRESHOLD = 6;

    let dragging = false;

    const rect = section.getBoundingClientRect();
    const offsetY = startY - rect.top;
    const originalLeft = rect.left;
    const originalWidth = rect.width;
    const originalHeight = rect.height;

    let lastAfterElement;

    function beginDragVisuals() {

        dragging = true;

        const placeholder = getTierPlaceholder();
        placeholder.style.height = originalHeight + "px";

        placeholder.innerHTML = `
            <div class="tier-label" style="background:${tier.colour}">
                <h2>${tier.name}</h2>
            </div>
            <div class="tier-content"></div>
        `;

        tierContainer.insertBefore(placeholder, section);

        section.classList.add("dragging-ghost");
        section.style.position = "fixed";
        section.style.left = originalLeft + "px";
        section.style.top = (startY - offsetY) + "px";
        section.style.width = originalWidth + "px";
        section.style.zIndex = "10000";
        section.style.pointerEvents = "none";

        document.body.appendChild(section);
    }

    function onPointerMove(event) {

        if (event.pointerId !== pointerId) {
            return;
        }

        const dx = event.clientX - startX;
        const dy = event.clientY - startY;

        if (!dragging) {

            if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) {
                return;
            }

            beginDragVisuals();
        }

        event.preventDefault();

        section.style.top = (event.clientY - offsetY) + "px";

        const afterElement = getVerticalAfterElement(tierContainer, event.clientY);

        if (afterElement === lastAfterElement) {
            return;
        }

        lastAfterElement = afterElement;

        const otherTiers = [...tierContainer.querySelectorAll(".tier:not(.dragging-ghost)")];

        animateShift(otherTiers, () => {

            const placeholder = getTierPlaceholder();

            if (afterElement == null) {
                tierContainer.appendChild(placeholder);
            } else {
                tierContainer.insertBefore(placeholder, afterElement);
            }
        });
    }

    function onPointerUp(event) {

        if (event.pointerId !== pointerId) {
            return;
        }

        cleanup();

        if (!dragging) {
            return;
        }

        finishDrag();
    }

    function onPointerCancel(event) {

        if (event.pointerId !== pointerId) {
            return;
        }

        cleanup();

        if (dragging) {
            removeTierPlaceholder();
            section.remove();
            render();
        }
    }

    function cleanup() {
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", onPointerUp);
        document.removeEventListener("pointercancel", onPointerCancel);
    }

    function finishDrag() {

        const placeholder = getTierPlaceholder();
        const parent = placeholder.parentNode;

        if (!parent) {
            removeTierPlaceholder();
            section.remove();
            render();
            return;
        }

        const siblings = Array.from(parent.children);
        const placeholderIndex = siblings.indexOf(placeholder);

        let targetIndex = 0;

        for (let i = 0; i < placeholderIndex; i++) {
            if (siblings[i].classList && siblings[i].classList.contains("tier")) {
                targetIndex++;
            }
        }

        removeTierPlaceholder();
        section.remove();
        moveTierToPosition(tier, targetIndex);
    }

    document.addEventListener("pointermove", onPointerMove, { passive: false });
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerCancel);
}


/* ==================================
   TIER DRAG PLACEHOLDER + POSITIONING
================================== */

let tierPlaceholder = null;

function getTierPlaceholder() {

    if (!tierPlaceholder) {
        tierPlaceholder = document.createElement("div");
        tierPlaceholder.className = "tier tier-placeholder";
    }

    return tierPlaceholder;
}

function removeTierPlaceholder() {

    if (tierPlaceholder && tierPlaceholder.parentNode) {
        tierPlaceholder.parentNode.removeChild(tierPlaceholder);
    }
}

function getVerticalAfterElement(container, y) {

    const sections = [...container.querySelectorAll(".tier:not(.dragging-ghost)")];

    return sections.reduce(
        function (closest, section) {

            const box = section.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: section };
            } else {
                return closest;
            }
        },
        { offset: Number.NEGATIVE_INFINITY, element: null }
    ).element;
}

function moveTierToPosition(tier, targetIndex) {

    const others = data.tiers
        .filter(t => t.id !== tier.id)
        .sort((a, b) => a.order - b.order);

    others.splice(targetIndex, 0, tier);

    others.forEach((t, index) => {
        t.order = index;
    });

    data.tiers = others;

    save();
    render();
}


/* ==================================
   TIER MENU
================================== */

function openTierMenu(tier, button) {

    showMenu(button, [

        {
            label: "Rename Tier",
            action: function () {

                openModal(
                    "Rename Tier",
                    `<input id="tierNameInput" value="${tier.name}">`,
                    "Save",
                    function () {

                        const name = document.getElementById("tierNameInput").value.trim();

                        if (name) {
                            tier.name = name;
                            save();
                            render();
                        }
                    }
                );
            }
        },

        {
            label: "Change Colour",
            action: function () {

                openModal(
                    "Change Colour",
                    `<input type="color" id="tierColourInput" value="${tier.colour}">`,
                    "Save",
                    function () {

                        tier.colour = document.getElementById("tierColourInput").value;
                        save();
                        render();
                    }
                );
            }
        },

        {
            label: "Delete Tier",
            action: function () {

                openModal(
                    "Delete Tier",
                    `<p>Delete this tier? Movies will return to Movie Bank.</p>`,
                    "Delete",
                    function () {

                        data.movies.forEach(movie => {

                            if (movie.tier === tier.id) {
                                movie.tier = null;
                                movie.order = 0;
                            }
                        });

                        data.tiers = data.tiers.filter(t => t.id !== tier.id);

                        normaliseMovieOrders();
                        save();
                        render();
                    }
                );
            }
        }

    ]);
}


/* ==================================
   MOVIE CARD CREATION
================================== */

function createMovie(movie) {

    const card = document.createElement("div");
    card.className = "movie-card";
    card.dataset.movie = movie.id;

    let posterContent;

    if (movie.poster) {
        posterContent = `<img src="${movie.poster}" alt="${movie.title} poster" draggable="false">`;
    } else if (movie.textPoster) {
        const colorStyle = movie.posterColor ? ` style="background:${movie.posterColor}"` : "";
        posterContent = `<div class="text-poster"${colorStyle}>${movie.title}</div>`;
    } else {
        posterContent = "🎬";
    }

    card.innerHTML = `
        <div class="poster">
            ${posterContent}
        </div>
        <div class="movie-title">${movie.title}</div>
        <button class="movie-menu">⋮</button>
    `;

    if (data.settings.cardStyle === "poster") {
        card.classList.add("poster-only");
    }

    setupMovieDragging(card, movie);

    const menuButton = card.querySelector(".movie-menu");

    menuButton.onclick = function (event) {
        event.stopPropagation();
        openMovieMenu(movie, this);
    };

    return card;
}


/* ==================================
   TMDB POSTER LOOKUP
   Looks a title up on TMDb and, if found, saves the poster
   URL onto the movie and re-renders. Runs in the background
   so adding movies still feels instant.

   mediaType can be "movie", "tv", or left out. When left out,
   it uses TMDb's "multi" search, which checks movies, TV
   shows, AND people in one call and tags each result with
   its type — that's what lets an unmarked title still match
   a TV show. Passing "movie" or "tv" explicitly searches
   only that catalog, for when you know exactly what it is.
================================== */

async function fetchPosterUrl(title, mediaType) {

    if (!TMDB_API_KEY || TMDB_API_KEY === "PASTE_YOUR_TMDB_API_KEY_HERE") {
        return null;
    }

    const endpoint =
        mediaType === "movie" ? "search/movie" :
        mediaType === "tv" ? "search/tv" :
        "search/multi";

    try {

        const searchUrl =
            "https://api.themoviedb.org/3/" + endpoint +
            "?api_key=" + TMDB_API_KEY +
            "&query=" + encodeURIComponent(title);

        const response = await fetch(searchUrl);
        const result = await response.json();

        if (result.success === false) {
            console.error("TMDb rejected the request for \"" + title + "\" via " + endpoint + ":", result.status_message);
            return null;
        }

        const firstMatch = result.results && result.results.find(entry => {

            if (!entry.poster_path) {
                return false;
            }

            if (endpoint === "search/multi") {
                return entry.media_type === "movie" || entry.media_type === "tv";
            }

            return true;
        });

        if (firstMatch) {
            return "https://image.tmdb.org/t/p/w300" + firstMatch.poster_path;
        }

        console.warn("TMDb: no poster match for \"" + title + "\" via " + endpoint, result);

    } catch (error) {
        console.error("TMDb lookup failed for \"" + title + "\":", error);
    }

    return null;
}

/* ==================================
   THROTTLED BULK POSTER FETCHING
   TMDb doesn't publish a hard rate limit, but it does throttle
   bursts of traffic — firing 100+ lookups in the same instant
   (like a big bulk import) risks some silently failing. This
   processes a small batch at a time with a short pause between
   batches instead of firing everything at once.
================================== */

async function fetchPostersWithThrottle(items, workerFn) {

    const BATCH_SIZE = 5;
    const BATCH_DELAY_MS = 400;

    for (let i = 0; i < items.length; i += BATCH_SIZE) {

        const batch = items.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(workerFn));

        if (i + BATCH_SIZE < items.length) {
            await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
        }
    }
}

async function attachPoster(movie) {

    const posterUrl = await fetchPosterUrl(movie.title, movie.mediaType);

    if (posterUrl) {
        movie.poster = posterUrl;
        save();
        render();
    }
}


/* ==================================
   TITLE TYPE PARSING
   Lets a title carry its own type override by ending with
   "(tv)" or "(movie)" — e.g. "Severance (tv)". Strips the
   tag from the stored title and returns it separately. If no
   tag is present, falls back to whatever default is passed in.
================================== */

function parseTitleAndType(rawTitle, defaultType) {

    const match = rawTitle.match(/\s*\(\s*(tv show|tv|movie)\s*\)\s*$/i);

    if (!match) {
        return { title: rawTitle, mediaType: defaultType };
    }

    const tag = match[1].toLowerCase();
    const mediaType = tag.startsWith("tv") ? "tv" : "movie";
    const cleanTitle = rawTitle.slice(0, match.index).trim();

    return { title: cleanTitle || rawTitle, mediaType: mediaType };
}


/* ==================================
   MOVIE DRAGGING
   Built on Pointer Events so it works the same way with a
   mouse or a finger. The dragged card itself becomes a
   floating "ghost" that follows the pointer; a thin blue
   placeholder line marks the exact gap it will drop into —
   this works across every row, including the Movie Bank.
================================== */

function setupMovieDragging(card, movie) {

    card.addEventListener("pointerdown", function (event) {

        if (event.target.closest(".movie-menu")) {
            return;
        }

        if (event.button !== undefined && event.button !== 0) {
            return;
        }

        startMovieDrag(event, card, movie);
    });
}

function startMovieDrag(startEvent, card, movie) {

    const pointerId = startEvent.pointerId;
    const startX = startEvent.clientX;
    const startY = startEvent.clientY;

    const DRAG_THRESHOLD = 6;

    let dragging = false;

    const rect = card.getBoundingClientRect();
    const offsetX = startX - rect.left;
    const offsetY = startY - rect.top;
    const originalWidth = rect.width;

    const originalParent = card.parentNode;
    const originalNextSibling = card.nextSibling;

    let lastAfterElement;
    let lastContainer;

    function beginDragVisuals() {

        dragging = true;

        const placeholder = getPlaceholder();
        originalParent.insertBefore(placeholder, originalNextSibling);

        card.classList.add("dragging-ghost");
        card.style.position = "fixed";
        card.style.width = originalWidth + "px";
        card.style.left = (startX - offsetX) + "px";
        card.style.top = (startY - offsetY) + "px";
        card.style.zIndex = "10000";
        card.style.pointerEvents = "none";

        document.body.appendChild(card);
    }

    function onPointerMove(event) {

        if (event.pointerId !== pointerId) {
            return;
        }

        const dx = event.clientX - startX;
        const dy = event.clientY - startY;

        if (!dragging) {

            if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) {
                return;
            }

            beginDragVisuals();
        }

        event.preventDefault();

        card.style.left = (event.clientX - offsetX) + "px";
        card.style.top = (event.clientY - offsetY) + "px";

        updateDropTarget(event.clientX, event.clientY);
    }

    function updateDropTarget(x, y) {

        const elementBelow = document.elementFromPoint(x, y);

        if (!elementBelow) {
            return;
        }

        const container = elementBelow.closest(".movies");

        if (!container) {
            return;
        }

        const placeholder = getPlaceholder();
        const afterElement = getDragAfterElement(container, x, y);

        if (afterElement === lastAfterElement && container === lastContainer) {
            return;
        }

        lastAfterElement = afterElement;
        lastContainer = container;

        const cardsInRow = [...container.querySelectorAll(".movie-card:not(.dragging-ghost)")];

        animateShift(cardsInRow, () => {

            if (afterElement == null) {
                container.appendChild(placeholder);
            } else {
                container.insertBefore(placeholder, afterElement);
            }
        });
    }

    function onPointerUp(event) {

        if (event.pointerId !== pointerId) {
            return;
        }

        cleanup();

        if (!dragging) {
            return;
        }

        finishDrag();
    }

    function onPointerCancel(event) {

        if (event.pointerId !== pointerId) {
            return;
        }

        cleanup();

        if (dragging) {
            removePlaceholder();
            card.remove();
            render();
        }
    }

    function cleanup() {
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", onPointerUp);
        document.removeEventListener("pointercancel", onPointerCancel);
    }

    function finishDrag() {

        const placeholder = getPlaceholder();
        const parent = placeholder.parentNode;

        if (!parent) {
            removePlaceholder();
            card.remove();
            render();
            return;
        }

        let tierID = null;

        if (parent.dataset && parent.dataset.tier !== undefined) {
            tierID = Number(parent.dataset.tier);
        }

        const children = Array.from(parent.children);
        const placeholderIndex = children.indexOf(placeholder);

        let targetIndex = 0;

        for (let i = 0; i < placeholderIndex; i++) {
            if (children[i].classList && children[i].classList.contains("movie-card")) {
                targetIndex++;
            }
        }

        removePlaceholder();
        card.remove();
        moveMovieToPosition(movie, tierID, targetIndex);
    }

    document.addEventListener("pointermove", onPointerMove, { passive: false });
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerCancel);
}


/* ==================================
   DRAG PLACEHOLDER
   A single shared placeholder element that gets moved
   around the DOM to show where the movie will land.
================================== */

let dragPlaceholder = null;

function getPlaceholder() {

    if (!dragPlaceholder) {
        dragPlaceholder = document.createElement("div");
        dragPlaceholder.className = "drag-placeholder";
    }

    return dragPlaceholder;
}

function removePlaceholder() {

    if (dragPlaceholder && dragPlaceholder.parentNode) {
        dragPlaceholder.parentNode.removeChild(dragPlaceholder);
    }
}


/* ==================================
   FIND INSERTION POINT
   Given a pointer position, finds which existing card
   the placeholder should sit BEFORE. Returns null if the
   placeholder should go at the very end of the row.
================================== */

function getDragAfterElement(container, x, y) {

    const cards = [...container.querySelectorAll(".movie-card:not(.dragging-ghost)")];

    if (cards.length === 0) {
        return null;
    }

    // Group the cards into their visual rows (wrapped lines), since a
    // row can now span more than one line.
    const rows = [];

    cards.forEach(card => {

        const box = card.getBoundingClientRect();
        let row = rows.find(r => Math.abs(r.top - box.top) < box.height / 2);

        if (!row) {
            row = { top: box.top, bottom: box.bottom, cards: [] };
            rows.push(row);
        }

        row.cards.push(card);
    });

    rows.sort((a, b) => a.top - b.top);

    // Work out which visual line the cursor is closest to.
    let targetRow = rows[0];
    let smallestDistance = Infinity;

    rows.forEach(row => {

        let distance;

        if (y < row.top) {
            distance = row.top - y;
        } else if (y > row.bottom) {
            distance = y - row.bottom;
        } else {
            distance = 0;
        }

        if (distance < smallestDistance) {
            smallestDistance = distance;
            targetRow = row;
        }
    });

    // Within that line, find the card the cursor is positioned in front of.
    const withinLine = targetRow.cards.reduce(
        function (closest, card) {

            const box = card.getBoundingClientRect();
            const offset = x - box.left - box.width / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: card };
            } else {
                return closest;
            }
        },
        { offset: Number.NEGATIVE_INFINITY, element: null }
    ).element;

    if (withinLine) {
        return withinLine;
    }

    // Cursor is past every card on this line — insert right before
    // whatever starts the next line, or at the very end if this is the last one.
    const rowIndex = rows.indexOf(targetRow);
    const nextRow = rows[rowIndex + 1];

    return nextRow ? nextRow.cards[0] : null;
}


/* ==================================
   MOVIE ORDER NORMALISATION
================================== */

function normaliseMovieOrders() {

    data.tiers.forEach(tier => {

        const movies = data.movies
            .filter(movie => movie.tier === tier.id)
            .sort((a, b) => a.order - b.order);

        movies.forEach((movie, index) => {
            movie.order = index;
        });
    });

    const bankMovies = data.movies
        .filter(movie => movie.tier === null)
        .sort((a, b) => a.order - b.order);

    bankMovies.forEach((movie, index) => {
        movie.order = index;
    });
}


/* ==================================
   MOVE MOVIE TO A SPECIFIC POSITION
   tierID is a tier's numeric id, or null for the Movie Bank.
   targetIndex is where it should land among the OTHER
   movies already in that tier/bank.
================================== */

function moveMovieToPosition(movie, tierID, targetIndex) {

    movie.tier = tierID;

    const siblings = data.movies
        .filter(m => m.tier === tierID && m.id !== movie.id)
        .sort((a, b) => a.order - b.order);

    siblings.splice(targetIndex, 0, movie);

    siblings.forEach((m, index) => {
        m.order = index;
    });

    normaliseMovieOrders();
    save();
    render();
}


/* ==================================
   MOVIE MENU
================================== */

function openMovieMenu(movie, button) {

    const singular = activeListType === "general" ? "Item" : "Movie";

    showMenu(button, [

        {
            label: "Edit " + singular,
            action: function () {

                const colorFieldHTML = movie.textPoster
                    ? `
                    <label class="color-picker-label">
                        Background Colour
                        <input type="color" id="editPosterColorInput" value="${movie.posterColor || "#2563eb"}">
                    </label>
                    `
                    : "";

                openModal(
                    "Edit " + singular,
                    `<input id="movieNameInput" value="${movie.title}">${colorFieldHTML}`,
                    "Save",
                    function () {

                        const name = document.getElementById("movieNameInput").value.trim();

                        if (name) {

                            movie.title = name;

                            if (movie.textPoster) {
                                movie.posterColor = document.getElementById("editPosterColorInput").value;
                            }

                            save();
                            render();
                        }
                    }
                );
            }
        },

        {
            label: activeListType === "general" ? "Move To Unranked" : "Move To Movie Bank",
            action: function () {

                movie.tier = null;
                movie.order = data.movies.filter(m => m.tier === null).length;

                normaliseMovieOrders();
                save();
                render();
            }
        },

        {
            label: "Delete " + singular,
            action: function () {

                openModal(
                    "Delete " + singular,
                    `<p>Delete ${movie.title}?</p>`,
                    "Delete",
                    function () {

                        data.movies = data.movies.filter(m => m.id !== movie.id);

                        normaliseMovieOrders();
                        save();
                        render();
                    }
                );
            }
        }

    ]);
}


/* ==================================
   RENDER SYSTEM
================================== */

function render() {

    tierContainer.innerHTML = "";
    movieBank.innerHTML = "";

    [...data.tiers]
        .sort((a, b) => a.order - b.order)
        .forEach(createTier);

    const sortedMovies = [...data.movies].sort((a, b) => a.order - b.order);

    sortedMovies.forEach(movie => {

        let location;

        if (movie.tier !== null) {
            location = document.querySelector(`[data-tier="${movie.tier}"].movies, [data-tier="${movie.tier}"] .movies`);
        } else {
            location = movieBank;
        }

        if (location) {
            location.appendChild(createMovie(movie));
        }
    });
}


/* ==================================
   ADD SINGLE MOVIE
================================== */

addMovieButton.onclick = function () {

    if (activeListType === "general") {

        openModal(
            "Add Item",
            `
            <input id="movieNameInput" placeholder="Item name">
            <label class="color-picker-label">
                Background Colour
                <input type="color" id="posterColorInput" value="#2563eb">
            </label>
            `,
            "Add",
            function () {

                const title = document.getElementById("movieNameInput").value.trim();

                if (!title) {
                    return;
                }

                const posterColor = document.getElementById("posterColorInput").value;

                data.movies.push({
                    id: Date.now(),
                    title: title,
                    tier: null,
                    order: data.movies.length,
                    poster: null,
                    textPoster: true,
                    posterColor: posterColor
                });

                save();
                render();
            }
        );

        return;
    }

    let selectedType = "movie";

    openModal(
        "Add",
        `
        <input id="movieNameInput" placeholder='Title — or add "(tv)" to force a type'>
        <div class="type-toggle">
            <button type="button" id="typeMovieBtn" class="type-toggle-option selected">🎬 Movie</button>
            <button type="button" id="typeTvBtn" class="type-toggle-option">📺 TV Show</button>
        </div>
        `,
        "Add",
        function () {

            const raw = document.getElementById("movieNameInput").value.trim();

            if (!raw) {
                return;
            }

            const parsed = parseTitleAndType(raw, selectedType);

            const newMovie = {
                id: Date.now(),
                title: parsed.title,
                tier: null,
                order: data.movies.length,
                poster: null,
                mediaType: parsed.mediaType
            };

            data.movies.push(newMovie);

            save();
            render();

            attachPoster(newMovie);
        }
    );

    const movieBtn = document.getElementById("typeMovieBtn");
    const tvBtn = document.getElementById("typeTvBtn");

    movieBtn.onclick = function () {
        selectedType = "movie";
        movieBtn.classList.add("selected");
        tvBtn.classList.remove("selected");
    };

    tvBtn.onclick = function () {
        selectedType = "tv";
        tvBtn.classList.add("selected");
        movieBtn.classList.remove("selected");
    };
};


/* ==================================
   ADD MOVIE (TEXT POSTER)
   Same as Add Movie, but skips the TMDb lookup entirely —
   the title itself is shown styled as the poster instead.
   Useful for anything TMDb won't match, or when you just
   don't want an image fetched.
================================== */

addTextPosterMovieButton.onclick = function () {

    openModal(
        "Add Movie (Text Poster)",
        `
        <input id="movieNameInput" placeholder="Movie name">
        <label class="color-picker-label">
            Background Colour
            <input type="color" id="posterColorInput" value="#2563eb">
        </label>
        `,
        "Add",
        function () {

            const title = document.getElementById("movieNameInput").value.trim();

            if (!title) {
                return;
            }

            const posterColor = document.getElementById("posterColorInput").value;

            data.movies.push({
                id: Date.now(),
                title: title,
                tier: null,
                order: data.movies.length,
                poster: null,
                textPoster: true,
                posterColor: posterColor
            });

            save();
            render();
        }
    );
};


/* ==================================
   ADD MULTIPLE MOVIES
================================== */

addMultipleMoviesButton.onclick = function () {

    if (activeListType === "general") {

        openModal(
            "Bulk Import",
            `
            <textarea id="multipleMovieInput" placeholder="Enter item names separated by commas or new lines"></textarea>
            <label class="color-picker-label">
                Background Colour (applies to all)
                <input type="color" id="posterColorInput" value="#2563eb">
            </label>
            `,
            "Add Items",
            function () {

                const text = document.getElementById("multipleMovieInput").value;
                const posterColor = document.getElementById("posterColorInput").value;

                const titles = text
                    .split(/[\n,]+/)
                    .map(title => title.trim())
                    .filter(title => title.length);

                const startingOrder = data.movies.length;

                titles.forEach((title, index) => {

                    data.movies.push({
                        id: Date.now() + Math.random(),
                        title: title,
                        tier: null,
                        order: startingOrder + index,
                        poster: null,
                        textPoster: true,
                        posterColor: posterColor
                    });
                });

                save();
                render();
            }
        );

        return;
    }

    openModal(
        "Add Multiple Movies",
        `<textarea id="multipleMovieInput" placeholder='Enter titles separated by commas or new lines — add "(tv)" after any title to force it as a TV show'></textarea>`,
        "Add Movies",
        function () {

            const text = document.getElementById("multipleMovieInput").value;

            const rawTitles = text
                .split(/[\n,]+/)
                .map(title => title.trim())
                .filter(title => title.length);

            const startingOrder = data.movies.length;

            const newMovies = rawTitles.map((rawTitle, index) => {

                const parsed = parseTitleAndType(rawTitle, undefined);

                return {
                    id: Date.now() + Math.random(),
                    title: parsed.title,
                    tier: null,
                    order: startingOrder + index,
                    poster: null,
                    mediaType: parsed.mediaType
                };
            });

            newMovies.forEach(movie => {
                data.movies.push(movie);
            });

            save();
            render();

            fetchPostersWithThrottle(newMovies, attachPoster);
        }
    );
};


/* ==================================
   DELETE MULTIPLE MOVIES
================================== */

deleteMoviesButton.onclick = function () {

    const modalTitleText = activeListType === "general" ? "Delete Items" : "Delete Movies";

    if (data.movies.length === 0) {

        openModal(
            modalTitleText,
            `<p>You don't have any ${noun("movies", "items")} yet.</p>`,
            "OK",
            function () {}
        );

        return;
    }

    const rowsHTML = [...data.movies]
        .sort((a, b) => a.title.localeCompare(b.title))
        .map(movie => `
            <label class="delete-movie-row">
                <input type="checkbox" class="deleteMovieCheckbox" data-movie-id="${movie.id}">
                ${movie.title}
            </label>
        `)
        .join("");

    openModal(
        modalTitleText,
        `
        <label class="delete-movie-row select-all-row">
            <input type="checkbox" id="selectAllMoviesCheckbox">
            <strong>Select All</strong>
        </label>
        <div class="delete-movie-list">${rowsHTML}</div>
        `,
        "Delete Selected",
        function () {

            const checked = modalContent.querySelectorAll(".deleteMovieCheckbox:checked");
            const idsToDelete = Array.from(checked).map(box => Number(box.dataset.movieId));

            if (idsToDelete.length === 0) {
                return;
            }

            data.movies = data.movies.filter(movie => !idsToDelete.includes(movie.id));

            normaliseMovieOrders();
            save();
            render();
        }
    );

    const selectAllCheckbox = document.getElementById("selectAllMoviesCheckbox");

    selectAllCheckbox.onchange = function () {

        const allCheckboxes = modalContent.querySelectorAll(".deleteMovieCheckbox");

        allCheckboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
    };
};


/* ==================================
   ADD TIER
================================== */

addTierButton.onclick = function () {

    openModal(
        "Add Tier",
        `
        <input id="tierNameInput" placeholder="Tier name">
        <br><br>
        <input type="color" id="tierColourInput" value="#6b7280">
        `,
        "Add Tier",
        function () {

            const name = document.getElementById("tierNameInput").value.trim();
            const colour = document.getElementById("tierColourInput").value;

            if (!name) {
                return;
            }

            data.tiers.push({
                id: Date.now(),
                name: name,
                colour: colour,
                order: data.tiers.length
            });

            save();
            render();
        }
    );
};


/* ==================================
   SETTINGS
================================== */

settingsButton.onclick = function () {
    aboutPanel.classList.add("hidden");
    settingsPanel.classList.toggle("hidden");
};

document.querySelectorAll('input[name="cardStyle"]').forEach(option => {

    option.checked = option.value === data.settings.cardStyle;

    option.onchange = function () {
        data.settings.cardStyle = option.value;
        save();
        render();
    };
});


/* ==================================
   ABOUT
================================== */

aboutButton.onclick = function () {
    settingsPanel.classList.add("hidden");
    aboutPanel.classList.toggle("hidden");
};


/* ==================================
   FINAL START
================================== */

const startingList = appStore.lists.find(l => l.id === appStore.activeListId);

if (startingList) {
    openList(startingList.id);
} else {
    goHome();
}
