let canvas, ctx;

let bird, pipes, score, lives;
let gameRunning = false;
let mode = "AI";

let gameSpeed = 2;
let gravity = 0.4;

let prevState = null;
let prevAction = null;

function startGame() {
    document.getElementById("menu").style.display = "none";
    document.getElementById("gameUI").style.display = "block";

    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    resetGame();
    gameRunning = true;
    loop();
}

function resetGame() {
    bird = { x: 80, y: canvas.height / 2, velocity: 0 };
    pipes = [];
    score = 0;
    lives = 3;

    document.getElementById("score").innerText = score;
    document.getElementById("lives").innerText = "❤️❤️❤️";
}

function restartGame() {
    resetGame();
}

function pauseGame() {
    gameRunning = !gameRunning;
}

function setMode(m) {
    mode = m;
    document.getElementById("modeText").innerText = "Mode: " + m;
}

function jump() {
    bird.velocity = -7;
}

document.addEventListener("keydown", e => {
    if (e.code === "Space") jump();
});

canvas?.addEventListener("click", jump);
canvas?.addEventListener("touchstart", e => {
    e.preventDefault();
    jump();
});

function spawnPipe() {
    let gap = canvas.height * 0.3;
    let top = Math.random() * (canvas.height - gap - 50);
    pipes.push({ x: canvas.width, top, bottom: top + gap, passed: false });
}

function update() {
    if (!gameRunning) return;

    let currentPipe = pipes[0];
    let dist = currentPipe ? currentPipe.x - bird.x : 0;

    let state = { y: bird.y, dist: dist };

    // AI ACTION
    if (mode === "AI") {
        fetch("/get_action", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(state)
        })
        .then(res => res.json())
        .then(data => {
            prevAction = data.action;
            if (data.action === 1) jump();
        });
    }

    // physics
    bird.velocity += gravity;
    bird.y += bird.velocity;

    pipes.forEach(p => p.x -= gameSpeed);

    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width / 2) {
        spawnPipe();
    }

    let reward = 0.1;

    // collision
    if (
        bird.y > canvas.height ||
        bird.y < 0 ||
        (
            currentPipe &&
            currentPipe.x < bird.x &&
            currentPipe.x + 50 > bird.x &&
            (bird.y < currentPipe.top || bird.y > currentPipe.bottom)
        )
    ) {
        reward = -10;
        lives--;

        if (lives <= 0) {
            alert("Game Over");
            gameRunning = false;
        }

        bird.y = canvas.height / 2;
        bird.velocity = 0;
    }

    // scoring
    if (currentPipe && !currentPipe.passed && currentPipe.x < bird.x) {
        currentPipe.passed = true;
        score++;
        reward = 5;
        document.getElementById("score").innerText = score;
    }

    // RL UPDATE
    if (prevState && prevAction !== null) {
        fetch("/update_q", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                y: prevState.y,
                dist: prevState.dist,
                ny: bird.y,
                ndist: dist,
                action: prevAction,
                reward: reward
            })
        });
    }

    prevState = state;
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
