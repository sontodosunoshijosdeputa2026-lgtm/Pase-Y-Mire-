/*
 * ============================================================
 * APLICACIÓN PRINCIPAL
 * ============================================================
 */

(function () {

    "use strict";


    const state = {

        games: [],

        featuredGames: [],

        walletBalance: 0,

        initialized: false

    };


    const elements = {

        loadingScreen:
            document.getElementById("loading-screen"),

        mainApp:
            document.getElementById("main-app"),

        featuredGames:
            document.getElementById("featured-games"),

        gamesGrid:
            document.getElementById("games-grid"),

        walletBalance:
            document.getElementById("wallet-balance"),

        walletButton:
            document.getElementById("wallet-button"),

        gameModal:
            document.getElementById("game-modal"),

        gameModalContent:
            document.getElementById("game-modal-content"),

        closeGameModal:
            document.getElementById("close-game-modal"),

        modalBackdrop:
            document.getElementById("modal-backdrop"),

        toast:
            document.getElementById("toast")

    };


    /*
     * ========================================================
     * INICIO
     * ========================================================
     */

    document.addEventListener(
        "DOMContentLoaded",
        init
    );


    async function init() {

        setupEvents();

        await loadGames();

        await loadWallet();

        showApplication();

        state.initialized = true;

    }


    /*
     * ========================================================
     * EVENTOS
     * ========================================================
     */

    function setupEvents() {

        if (elements.closeGameModal) {

            elements.closeGameModal.addEventListener(
                "click",
                closeGameModal
            );

        }


        if (elements.modalBackdrop) {

            elements.modalBackdrop.addEventListener(
                "click",
                closeGameModal
            );

        }


        if (elements.walletButton) {

            elements.walletButton.addEventListener(
                "click",
                function () {

                    showToast(
                        "Los créditos son virtuales."
                    );

                }
            );

        }


        document
            .querySelectorAll(".nav-item")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const section =
                            button.dataset.section;

                        document
                            .querySelectorAll(".nav-item")
                            .forEach(function (item) {

                                item.classList.remove(
                                    "active"
                                );

                            });

                        button.classList.add(
                            "active"
                        );


                        if (section === "favorites") {

                            showToast(
                                "Favoritos estará disponible próximamente."
                            );

                            return;

                        }


                        if (section === "profile") {

                            showToast(
                                "Perfil estará disponible próximamente."
                            );

                            return;

                        }

                    }
                );

            });

    }


    /*
     * ========================================================
     * CARGAR JUEGOS
     * ========================================================
     */

    async function loadGames() {

        if (!window.supabaseClient) {

            loadDemoGames();

            return;

        }


        try {

            const {
                data,
                error
            } = await window.supabaseClient
                .from("slot_games")
                .select(
                    [
                        "id",
                        "slug",
                        "name",
                        "description",
                        "category",
                        "thumbnail_url",
                        "banner_url",
                        "enabled",
                        "featured",
                        "sort_order",
                        "min_bet",
                        "max_bet"
                    ].join(",")
                )
                .eq("enabled", true)
                .order("sort_order", {
                    ascending: true
                });


            if (error) {

                console.error(
                    "Error cargando juegos:",
                    error
                );

                loadDemoGames();

                showToast(
                    "No se pudieron cargar los juegos desde Supabase."
                );

                return;

            }


            state.games = data || [];

            state.featuredGames =
                state.games.filter(
                    game => game.featured === true
                );


            renderGames();

        } catch (error) {

            console.error(error);

            loadDemoGames();

        }

    }


    /*
     * ========================================================
     * JUEGOS DE DEMOSTRACIÓN
     * ========================================================
     *
     * Solamente aparecen si Supabase todavía no está
     * configurada o no responde.
     * ========================================================
     */

    function loadDemoGames() {

        state.games = [

            {
                id: "demo-1",
                slug: "golden-luck",
                name: "Golden Luck",
                description:
                    "Una tragamonedas clásica de estilo dorado.",
                category: "Clásicas",
                featured: true,
                min_bet: 10,
                max_bet: 1000
            },

            {
                id: "demo-2",
                slug: "diamond-royal",
                name: "Diamond Royal",
                description:
                    "Diamantes, lujo y símbolos brillantes.",
                category: "Premium",
                featured: true,
                min_bet: 10,
                max_bet: 2000
            },

            {
                id: "demo-3",
                slug: "lucky-fruits",
                name: "Lucky Fruits",
                description:
                    "Frutas clásicas con una estética moderna.",
                category: "Clásicas",
                featured: true,
                min_bet: 5,
                max_bet: 1000
            },

            {
                id: "demo-4",
                slug: "neon-seven",
                name: "Neon Seven",
                description:
                    "Estilo retro futurista.",
                category: "Retro",
                featured: false,
                min_bet: 10,
                max_bet: 1500
            },

            {
                id: "demo-5",
                slug: "royal-crown",
                name: "Royal Crown",
                description:
                    "Corona, joyas y símbolos reales.",
                category: "Premium",
                featured: false,
                min_bet: 20,
                max_bet: 2500
            },

            {
                id: "demo-6",
                slug: "wild-west",
                name: "Wild West",
                description:
                    "Una tragamonedas inspirada en el oeste.",
                category: "Aventura",
                featured: false,
                min_bet: 10,
                max_bet: 1500
            }

        ];


        state.featuredGames =
            state.games.filter(
                game => game.featured
            );


        renderGames();

    }


    /*
     * ========================================================
     * RENDER
     * ========================================================
     */

    function renderGames() {

        renderFeaturedGames();

        renderGamesGrid();

    }


    function renderFeaturedGames() {

        if (!elements.featuredGames) {
            return;
        }


        if (!state.featuredGames.length) {

            elements.featuredGames.innerHTML =
                createEmptyState(
                    "Todavía no hay juegos destacados."
                );

            return;

        }


        elements.featuredGames.innerHTML =
            state.featuredGames
                .map(createFeaturedCard)
                .join("");


        elements.featuredGames
            .querySelectorAll("[data-game-id]")
            .forEach(function (card) {

                card.addEventListener(
                    "click",
                    function () {

                        openGame(
                            card.dataset.gameId
                        );

                    }
                );

            });

    }


    function renderGamesGrid() {

        if (!elements.gamesGrid) {
            return;
        }


        if (!state.games.length) {

            elements.gamesGrid.innerHTML =
                createEmptyState(
                    "No hay juegos disponibles."
                );

            return;

        }


        elements.gamesGrid.innerHTML =
            state.games
                .map(createGameCard)
                .join("");


        elements.gamesGrid
            .querySelectorAll("[data-game-id]")
            .forEach(function (card) {

                card.addEventListener(
                    "click",
                    function () {

                        openGame(
                            card.dataset.gameId
                        );

                    }
                );

            });

    }


    /*
     * ========================================================
     * CARDS
     * ========================================================
     */

    function createFeaturedCard(game) {

        const name =
            escapeHtml(game.name);

        const description =
            escapeHtml(
                game.description || "Descubrí este juego."
            );


        return `
            <article
                class="featured-card"
                data-game-id="${escapeAttribute(game.id)}"
            >

                <div class="featured-content">

                    <span class="tag">
                        DESTACADO
                    </span>

                    <h3>
                        ${name}
                    </h3>

                    <p>
                        ${description}
                    </p>

                    <button
                        class="play-button"
                        type="button"
                    >
                        Jugar →
                    </button>

                </div>

            </article>
        `;

    }


    function createGameCard(game) {

        const name =
            escapeHtml(game.name);

        const category =
            escapeHtml(
                game.category || "Tragamonedas"
            );


        const minBet =
            Number(game.min_bet || 0);


        const symbols =
            getSymbols(game.slug);


        return `
            <article
                class="game-card"
                data-game-id="${escapeAttribute(game.id)}"
            >

                <div class="game-art">

                    <div class="game-symbols">

                        ${symbols
                            .map(
                                symbol => `
                                    <span class="game-symbol">
                                        ${symbol}
                                    </span>
                                `
                            )
                            .join("")}

                    </div>

                </div>


                <div class="game-info">

                    <h3>
                        ${name}
                    </h3>

                    <span class="game-category">
                        ${category}
                    </span>

                    <div class="game-bet">

                        <span>
                            Desde ${formatCredits(minBet)}
                        </span>

                        <span>
                            ▶
                        </span>

                    </div>

                </div>

            </article>
        `;

    }


    function createEmptyState(message) {

        return `
            <div class="empty-state">

                <strong>
                    🎰
                </strong>

                <span>
                    ${escapeHtml(message)}
                </span>

            </div>
        `;

    }


    /*
     * ========================================================
     * SÍMBOLOS VISUALES
     * ========================================================
     */

    function getSymbols(slug) {

        const symbols = {

            "golden-luck":
                ["7", "★", "7"],

            "diamond-royal":
                ["💎", "👑", "💎"],

            "lucky-fruits":
                ["🍒", "🍋", "🍊"],

            "neon-seven":
                ["7", "⚡", "7"],

            "royal-crown":
                ["👑", "💎", "♛"],

            "wild-west":
                ["★", "🤠", "★"]

        };


        return symbols[slug] || ["7", "★", "7"];

    }


    /*
     * ========================================================
     * ABRIR JUEGO
     * ========================================================
     */

    function openGame(gameId) {

        const game =
            state.games.find(
                item => String(item.id) === String(gameId)
            );


        if (!game) {

            showToast(
                "No se encontró el juego."
            );

            return;

        }


        elements.gameModalContent.innerHTML = `

            <div class="game-preview">

                <span class="section-kicker">
                    TRAGAMONEDAS
                </span>

                <h2>
                    ${escapeHtml(game.name)}
                </h2>

                <p>
                    ${escapeHtml(
                        game.description ||
                        "Preparando el juego."
                    )}
                </p>

                <div class="coming-soon">

                    🎰

                    <br><br>

                    Este juego será integrado
                    en la próxima etapa.

                </div>

            </div>
        `;


        elements.gameModal.classList.remove(
            "hidden"
        );


        elements.gameModal.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    function closeGameModal() {

        elements.gameModal.classList.add(
            "hidden"
        );


        elements.gameModal.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    /*
     * ========================================================
     * BILLETERA
     * ========================================================
     */

    async function loadWallet() {

        elements.walletBalance.textContent =
            formatCredits(
                state.walletBalance
            );


        if (!window.supabaseClient) {
            return;
        }


        try {

            const {
                data: {
                    user
                }
            } = await window.supabaseClient
                .auth
                .getUser();


            if (!user) {
                return;
            }


            const {
                data,
                error
            } = await window.supabaseClient
                .from("game_wallets")
                .select("balance")
                .eq("user_id", user.id)
                .maybeSingle();


            if (error) {

                console.error(
                    "Error cargando billetera:",
                    error
                );

                return;

            }


            if (data) {

                state.walletBalance =
                    Number(data.balance || 0);

            }


            elements.walletBalance.textContent =
                formatCredits(
                    state.walletBalance
                );


        } catch (error) {

            console.error(error);

        }

    }


    /*
     * ========================================================
     * MOSTRAR APP
     * ========================================================
     */

    function showApplication() {

        if (elements.loadingScreen) {

            elements.loadingScreen.classList.add(
                "hidden"
            );

        }


        if (elements.mainApp) {

            elements.mainApp.classList.remove(
                "hidden"
            );

        }

    }


    /*
     * ========================================================
     * TOAST
     * ========================================================
     */

    let toastTimer = null;


    function showToast(message) {

        if (!elements.toast) {
            return;
        }


        elements.toast.textContent =
            message;


        elements.toast.classList.add(
            "show"
        );


        clearTimeout(toastTimer);


        toastTimer = setTimeout(
            function () {

                elements.toast.classList.remove(
                    "show"
                );

            },
            2500
        );

    }


    /*
     * ========================================================
     * FORMATO
     * ========================================================
     */

    function formatCredits(value) {

        const number =
            Number(value || 0);


        return number.toLocaleString(
            "es-AR"
        );

    }


    /*
     * ========================================================
     * SEGURIDAD HTML
     * ========================================================
     */

    function escapeHtml(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function escapeAttribute(value) {

        return escapeHtml(value);

    }


})();
