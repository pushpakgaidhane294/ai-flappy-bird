let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 500;

let bird = { x: 80, y: 200, velocity: 0 };
let gravity = 0.5;
let pipes = [];

let score = 0;
let highScore = localStorage.getItem("high") || 0;
let lives = 3;

let gameSpeed = 2;
let mode = "AI";

document.getElementById("high").innerText = highScore;

function setMode(m) {
    mode = m;
    document.getElementById("modeText").innerText = "Mode: " + m;
}

function updateLives() {
    document.getElementById("lives").innerText = "❤️".repeat(lives);
}

document.addEventListener("keydown", function(e) {
    if (mode === "HUMAN" && e.code === "Space") {
        bird.velocity = -8;
    }
});

function spawnPipe() {
    let gap = 130;
    let top = Math.random() * 250;
    pipes.push({ x: 400, top: top, bottom: top + gap, passed: false });
}

function drawBird() {
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(bird.x + 4, bird.y - 2, 2, 0, Math.PI * 2);
    ctx.fill();
}

function drawPipes() {
    ctx.fillStyle = "#2ecc71";
    pipes.forEach(p => {
        ctx.fillRect(p.x, 0, 50, p.top);
        ctx.fillRect(p.x, p.bottom, 50, 500);

        ctx.fillRect(p.x - 5, p.top - 20, 60, 20);
        ctx.fillRect(p.x - 5, p.bottom, 60, 20);
    });
}

function update() {
    bird.velocity += gravity;
    bird.y += bird.velocity;

    pipes.forEach(p => p.x -= gameSpeed);

    if (pipes.length === 0 || pipes[pipes.length - 1].x < 200) {
        spawnPipe();
    }

    let currentPipe = pipes[0];
    let dist = currentPipe.x - bird.x;

    if (mode === "AI") {
        fetch("/get_action", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ y: bird.y, dist: dist })
        })
        .then(res => res.json())
        .then(data => {
            if (data.action === 1) {
                bird.velocity = -8;
            }
        });
    }

    // Collision
    if (
        bird.y > canvas.height ||
        bird.y < 0 ||
        (
            currentPipe &&
            currentPipe.x < bird.x + 10 &&
            currentPipe.x + 50 > bird.x - 10 &&
            (bird.y < currentPipe.top || bird.y > currentPipe.bottom)
        )
    ) {
        lives--;
        updateLives();

        if (lives <= 0) {
            if (score > highScore) {
                localStorage.setItem("high", score);
            }
            alert("Game Over!");
            location.reload();
        }

        bird.y = 200;
        bird.velocity = 0;
    }

    // Score
    if (currentPipe && !currentPipe.passed && currentPipe.x < bird.x) {
        currentPipe.passed = true;
        score++;
        document.getElementById("score").innerText = score;
    }

    // Remove old pipes
    if (pipes[0] && pipes[0].x < -50) {
        pipes.shift();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBird();
    drawPipes();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

function startGame() {
    loop();
}

startGame();
