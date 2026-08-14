const wheel = document.getElementById("rouletteWheel");
const ball = document.getElementById("rouletteBall");
const spinButton = document.getElementById("rouletteSpin");
const result = document.getElementById("rouletteResult");
const message = document.getElementById("dealerMessage");

let spinning = false;

function spinRouletteVisual() {

    if (spinning) {
        return;
    }

    spinning = true;

    result.textContent = "—";
    message.textContent = "La rueda está girando...";

    spinButton.disabled = true;

    const rotation =
        1440 + Math.floor(Math.random() * 720);

    wheel.style.transform =
        `rotate(${rotation}deg)`;

    ball.classList.add("ball-spin");

    setTimeout(() => {

        const number =
            Math.floor(Math.random() * 37);

        result.textContent = number;

        message.textContent =
            `¡Salió el ${number}!`;

        ball.classList.remove("ball-spin");

        spinning = false;

        spinButton.disabled = false;

    }, 4500);

}

spinButton?.addEventListener(
    "click",
    spinRouletteVisual
);
