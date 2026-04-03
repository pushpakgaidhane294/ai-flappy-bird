let canvas, ctx;

let bird, pipes, score, lives;
let gameRunning = false;

let gravity = 0.4;
let gameSpeed = 2;
let pipeGap = 150;

function showSettings() {
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("settings").style.display = "block";
}

function startGame() {
    document.getElementById("settings").style.display = "none";
    document.getElementById("gameUI").style.display = "block";

    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // GET SETTINGS
    let difficulty = document.getElementById("difficulty").value;
    let speed = document.getElementById("speed").value;

    gameSpeed = parseInt(speed);

    if (difficulty === "easy") pipeGap = 180;
    if (difficulty === "medium") pipeGap = 140;
    if (difficulty === "hard") pipeGap = 110;

    resetGame();
    gameRunning = true;
    loop();
}

function resetGame() {
    bird = { x: 80, y: 200, velocity: 0 };
    pipes = [];
    score = 0;
    lives = 3;

    document.getElementById("score").innerText = score;
    document.getElementById("lives").innerText = "❤️❤️❤️";
}

function jump() {
    bird.velocity = -7;
}

// Desktop
document.addEventListener("keydown", e => {
    if (e.code === "Space") jump();
});

// Mobile tap
document.addEventListener("touchstart", e => {
    jump();
});

function spawnPipe() {
    let top = Math.random() * (canvas.height - pipeGap);
    pipes.push({ x: canvas.width, top, bottom: top + pipeGap });
}

function update() {
    if (!gameRunning) return;

    bird.velocity += gravity;
    bird.y += bird.velocity;

    pipes.forEach(p => p.x -= gameSpeed);

    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width / 2) {
        spawnPipe();
    }

    let p = pipes[0];

    // collision
    if (
        bird.y > canvas.height ||
        bird.y < 0 ||
        (p &&
            p.x < bird.x &&
            p.x + 50 > bird.x &&
            (bird.y < p.top || bird.y > p.bottom))
    ) {
        lives--;
        document.getElementById("lives").innerText = "❤️".repeat(lives);

        if (lives <= 0) {
            alert("Game Over");
            gameRunning = false;
        }

        bird.y = 200;
        bird.velocity = 0;
    }

    // scoring
    if (p && p.x + 50 < bird.x) {
        pipes.shift();
        score++;
        document.getElementById("score").innerText = score;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // bird
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "yellow";
    ctx.fill();

    // pipes
    ctx.fillStyle = "green";
    pipes.forEach(p => {
        ctx.fillRect(p.x, 0, 50, p.top);
        ctx.fillRect(p.x, p.bottom, 50, canvas.height);
    });
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}
