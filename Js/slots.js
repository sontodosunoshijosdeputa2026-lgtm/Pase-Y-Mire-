const symbols = [
    "🍒",
    "🍋",
    "🍊",
    "🍉",
    "🔔",
    "BAR",
    "7"
];

let spinning = false;
let bet = 2;

const reels = document.querySelectorAll(".reel");
const spinButton = document.getElementById("spinButton");
const status = document.getElementById("slotStatus");
const betValue = document.getElementById("betValue");

function randomSymbol() {
    return symbols[
        Math.floor(Math.random() * symbols.length)
    ];
}

function setReel(reel, symbol) {

    const element = reel.querySelector(".reel-symbol");

    if (element) {
        element.textContent = symbol;
    }

}

function spinVisual() {

    if (spinning) {
        return;
    }

    spinning = true;

    status.textContent = "LOS RODILLOS ESTÁN GIRANDO...";

    spinButton.disabled = true;

    reels.forEach(reel => {
        reel.classList.add("reel-spinning");
    });

    const delays = [900, 1300, 1700];

    reels.forEach((reel, index) => {

        setTimeout(() => {

            setReel(reel, randomSymbol());

            reel.classList.remove("reel-spinning");

            if (index === reels.length - 1) {

                spinning = false;

                spinButton.disabled = false;

                status.textContent = "RESULTADO LISTO";

            }

        }, delays[index]);

    });

}

spinButton?.addEventListener("click", spinVisual);

document.getElementById("betMinus")?.addEventListener("click", () => {

    bet = Math.max(2, bet - 2);

    betValue.textContent = bet;

});

document.getElementById("betPlus")?.addEventListener("click", () => {

    bet = Math.min(100, bet + 2);

    betValue.textContent = bet;

});
