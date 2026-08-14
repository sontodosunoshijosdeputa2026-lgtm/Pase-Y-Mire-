document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll(".large-game-card:not(.disabled-game)")
        .forEach(card => {

            card.addEventListener("keydown", event => {

                if (event.key === "Enter") {
                    card.click();
                }

            });

        });

});
