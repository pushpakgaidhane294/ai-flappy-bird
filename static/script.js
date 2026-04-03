let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 500;

let bird = { x: 50, y: 200, velocity: 0 };
let gravity = 0.5;
let pipes = [];
let score = 0;
let highScore = localStorage.getItem("high") || 0;
let lives = 3;

document.getElementById("high").innerText = highScore;

function spawnPipe() {
    let gap = 120;
    let top = Math.random() * 250;
    pipes.push({ x: 400, top: top, bottom: top + gap });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Bird
    ctx.fillStyle = "yellow";
    ctx.fillRect(bird.x, bird.y, 20, 20);

    // Pipes
    ctx.fillStyle = "green";
    pipes.forEach(p => {
        ctx.fillRect(p.x, 0, 40, p.top);
        ctx.fillRect(p.x, p.bottom, 40, 500);
    });
}

function update() {
    bird.velocity += gravity;
    bird.y += bird.velocity;

    pipes.forEach(p => p.x -= 2);

    if (pipes.length === 0 || pipes[pipes.length - 1].x < 200) {
        spawnPipe();
    }

    let currentPipe = pipes[0];
    let dist = currentPipe.x - bird.x;

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

    // Collision
    if (bird.y > 500 || bird.y < 0 ||
        (currentPipe.x < bird.x + 20 &&
         currentPipe.x + 40 > bird.x &&
         (bird.y < currentPipe.top || bird.y > currentPipe.bottom))) {

        lives--;
        document.getElementById("lives").innerText = lives;

        if (lives === 0) {
            if (score > highScore) {
                localStorage.setItem("high", score);
            }
            alert("Game Over");
            location.reload();
        }

        bird.y = 200;
        bird.velocity = 0;
    }

    // Score
    if (currentPipe.x === bird.x) {
        score++;
        document.getElementById("score").innerText = score;
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

function startGame() {
    loop();
}
