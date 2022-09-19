//Get the canvas and the canvas context
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

//Set the width and height to something good for a game and most devices
canvas.width = 1024;
canvas.height = 576;

//Make the background
c.fillRect(0, 0, canvas.width, canvas.height);

//Gravity constant
const gravity = 0.7;

//Jump limit
const jumpLimitGlobal = 2;

//Get the enemy and player health display
const playerHealthDisplay = document.querySelector("#playerHealth");
const enemyHealthDisplay = document.querySelector("#enemyHealth");

let timer = 60; //Length of game in seconds
const timeText = document.querySelector("#timeText");

//Text which tells us the outcome of the game
const gameEndText = document.querySelector("#gameEndText");

let gameOver = false;

//The background
const background = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    imageSrc: "./assets/background.png"
})

//The shop
const shop = new Sprite({
    position: {
        x: 600,
        y: 128
    },
    imageSrc: "./assets/shop.png",
    scale: 2.75,
    framesMax: 6
})

//Make the two players
const player = new Fighter({
    position: {
        x: 50,
        y: 0
    },
    velocity: {
        x: 0,
        y: 0.2
    },
    speed: 6,
    color: "blue",
    rangeSpeed: 7,
    direction: "right",
    imageSrc: "./assets/dojaCat/idle.png",
    scale: 2.5,
    framesMax: 6,
    offset: {
        x: 40,
        y: 10
    },
    sprites: {
        idle: {
            imageSrc: "./assets/dojaCat/idle.png"
        },
        run: {
            imageSrc: "./assets/dojaCat/run.png"
        }
    }
});

const enemy = new Fighter({
    position: {
        x: 890,
        y: 0
    },
    velocity: {
        x: 0,
        y: 0.2
    },
    speed: 6,
    color: "red",
    rangeSpeed: -7,
    direction: "left"
});

const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    }
};

function isBlocked(attacker, blocker) {
    if (attacker.direction == "right" && blocker.direction == "right" && blocker.isBlocking ||
        attacker.direction == "left" && blocker.direction == "left" && blocker.isBlocking) {
        return true;
    } else {
        return false;
    }
}

function whoWins({ player, enemy, timerId }) {
    //clearTimeout(timerId);

    gameEndText.style.display = "block";

    if (player.health === enemy.health) {
        gameEndText.innerHTML = "Tie";
    } else if (player.health > enemy.health) {
        gameEndText.innerHTML = "Player 1 wins";
    } else if (player.health < enemy.health) {
        gameEndText.innerHTML = "Player 2 wins";
    }

    gameOver = true;
}

decreaseTimer();

//A loop that will run forever and animate the canvas
function animate() {
    window.requestAnimationFrame(animate);
    c.fillStyle = "black";
    c.fillRect(0, 0, canvas.width, canvas.height);
    background.update();
    shop.update();
    player.update();
    //enemy.update();

    //Reset x velocity
    player.velocity.x = 0;
    enemy.velocity.x = 0;

    //Only do this stuff if the game is not over
    if (!gameOver) {
        //Player movement
        if (keys.d.pressed && player.lastKey === "d") {
            player.velocity.x = player.speed;
            player.direction = "right";
        } else if (keys.a.pressed && player.lastKey === "a") {
            player.velocity.x = -player.speed;
            player.direction = "left";
        }

        //Enemy movement
        if (keys.ArrowRight.pressed && enemy.lastKey === "ArrowRight") {
            enemy.velocity.x = enemy.speed;
            enemy.direction = "right";
        } else if (keys.ArrowLeft.pressed && enemy.lastKey === "ArrowLeft") {
            enemy.velocity.x = -enemy.speed;
            enemy.direction = "left";
        }

        //Detect for short range collision player
        if (attackCollision({ rectangle1: player, rectangle2: enemy }, "short") &&
            player.isAttacking) {

            player.isAttacking = false;
            if (!isBlocked(player, enemy)) {
                enemy.health -= 10;
                enemyHealthDisplay.style.width = enemy.health + "%";
                console.log("enemy health: " + enemy.health);
            } else {
                console.log("blocked!");
            }
        }

        //Detect for long range collision player
        if (attackCollision({ rectangle1: player, rectangle2: enemy }, "long") &&
            player.isAttackingRange) {

            player.isAttackingRange = false;
            if (!isBlocked(player, enemy)) {
                enemy.health -= 20;
                enemyHealthDisplay.style.width = enemy.health + "%";
                console.log("enemy health: " + enemy.health);
            } else {
                console.log("blocked!");
            }
        }

        //Detect for short range collision enemy
        if (attackCollision({ rectangle1: enemy, rectangle2: player }, "short") &&
            enemy.isAttacking) {

            enemy.isAttacking = false;
            if (!isBlocked(enemy, player)) {
                player.health -= 10;
                playerHealthDisplay.style.width = player.health + "%";
                console.log("player health: " + player.health);
            } else {
                console.log("blocked!");
            }
        }

        //Detect for long range collision enemy
        if (attackCollision({ rectangle1: enemy, rectangle2: player }, "long") &&
            enemy.isAttackingRange) {

            enemy.isAttackingRange = false;
            if (!isBlocked(enemy, player)) {
                player.health -= 20;
                playerHealthDisplay.style.width = player.health + "%";
                console.log("player health: " + player.health);
            } else {
                console.log("blocked!");
            }
        }

        //End game when health of one of the players reaches 0
        if (player.health <= 0 || enemy.health <= 0) {
            whoWins({ player, enemy, timerId });
        }
    }
}

animate();

window.addEventListener("keydown", (event) => {
    //Player keys
    switch (event.key) {
        case "d":
            keys.d.pressed = true;
            player.lastKey = "d";
            break;
        case "a":
            keys.a.pressed = true;
            player.lastKey = "a";
            break;
        case "w":
            player.jump();
            break;
        case "j":
            player.attack();
            break;
        case "k":
            player.attackRange();
            break;
        case "l":
            player.block();
            break;
    }

    //Enemy keys
    switch (event.key) {
        case "ArrowLeft":
            keys.ArrowLeft.pressed = true;
            enemy.lastKey = "ArrowLeft";
            break;
        case "ArrowRight":
            keys.ArrowRight.pressed = true;
            enemy.lastKey = "ArrowRight";
            break;
        case "ArrowUp":
            enemy.jump();
            break;
    }

    //Enemy attacks are on numpad so it should use code so it can be used with or without numlock
    switch (event.code) {
        case "Numpad1":
            enemy.attack();
            break;
        case "Numpad2":
            enemy.attackRange();
            break;
        case "Numpad3":
            enemy.block();
            break;
    }
});

window.addEventListener("keyup", (event) => {
    //Player keys
    switch (event.key) {
        case "d":
            keys.d.pressed = false;
            break;
        case "a":
            keys.a.pressed = false;
            break;
        case "l":
            player.isBlocking = false;
            break;
    }

    //Enemy keys
    switch (event.key) {
        case "ArrowLeft":
            keys.ArrowLeft.pressed = false;
            break;
        case "ArrowRight":
            keys.ArrowRight.pressed = false;
            break;
    }

    switch (event.code) {
        case "Numpad3":
            enemy.isBlocking = false;
            break;
    }
});