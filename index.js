//Get the canvas and the canvas context
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

//Set the width and height to something good for a game and most devices
canvas.width = 1024;
canvas.height = 576;

//Gravity constant
const gravity = 0.7;

//Jump limit
const jumpLimitGlobal = 2;

//Get the enemy and player health display
const playerHealthDisplay = document.querySelector("#playerHealth");
const enemyHealthDisplay = document.querySelector("#enemyHealth");

//Length of game in seconds
let timer = 60;
const timeText = document.querySelector("#timeText");

//Text which tells us the outcome of the game
const gameEndText = document.querySelector("#gameEndText");

//Variable that controls whether the game is over or not
let gameOver = false;

//Background sprite
const background = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    imageSrc: "./assets/background.png"
})

//Shop sprite
const shop = new Sprite({
    position: {
        x: 600,
        y: 128
    },
    imageSrc: "./assets/shop.png",
    scale: 2.75,
    framesMax: 6
})

//Make player 1
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
    imageSrc: "./assets/dojaCat/Idle.png",
    scale: 2.5,
    framesMax: 6,
    offset: {
        x: 50,
        y: 0
    },
    sprites: {
        //Right
        idle: {
            imageSrc: "./assets/dojaCat/Idle.png",
            framesMax: 6
        },
        run: {
            imageSrc: "./assets/dojaCat/Run.png",
            framesMax: 9
        },
        jump: {
            imageSrc: "./assets/dojaCat/Jump.png",
            framesMax: 3
        },
        fall: {
            imageSrc: "./assets/dojaCat/Fall.png",
            framesMax: 3
        },
        attackShort: {
            imageSrc: "./assets/dojaCat/Attack1.png",
            framesMax: 4
        },
        block: {
            imageSrc: "./assets/dojaCat/Jump.png",
            framesMax: 3
        },

        //Left
        idleLeft: {
            imageSrc: "./assets/dojaCat/Idle.png",
            framesMax: 6
        },
        runLeft: {
            imageSrc: "./assets/dojaCat/Run.png",
            framesMax: 9
        },
        jumpLeft: {
            imageSrc: "./assets/dojaCat/Jump.png",
            framesMax: 3
        },
        fallLeft: {
            imageSrc: "./assets/dojaCat/Fall.png",
            framesMax: 3
        },
        attackShortLeft: {
            imageSrc: "./assets/dojaCat/Attack1.png",
            framesMax: 4
        },
        blockLeft: {
            imageSrc: "./assets/dojaCat/Jump.png",
            framesMax: 3
        },
    }
});

//Make player 2
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
    direction: "left",
    imageSrc: "./assets/kenji/Idle.png",
    scale: 2.9,
    framesMax: 4,
    offset: {
        x: 260,
        y: 210
    },
    sprites: {
        //Right
        idle: {
            imageSrc: "./assets/kenji/IdleFlipped.png",
            framesMax: 4
        },
        run: {
            imageSrc: "./assets/kenji/RunFlipped.png",
            framesMax: 8
        },
        jump: {
            imageSrc: "./assets/kenji/JumpFlipped.png",
            framesMax: 2
        },
        fall: {
            imageSrc: "./assets/kenji/FallFlipped.png",
            framesMax: 2
        },
        attackShort: {
            imageSrc: "./assets/kenji/Attack1Flipped.png",
            framesMax: 4
        },
        block: {
            imageSrc: "./assets/kenji/FallFlipped.png",
            framesMax: 2
        },

        //Left
        idleLeft: {
            imageSrc: "./assets/kenji/Idle.png",
            framesMax: 4
        },
        runLeft: {
            imageSrc: "./assets/kenji/Run.png",
            framesMax: 8
        },
        jumpLeft: {
            imageSrc: "./assets/kenji/Jump.png",
            framesMax: 2
        },
        fallLeft: {
            imageSrc: "./assets/kenji/Fall.png",
            framesMax: 2
        },
        attackShortLeft: {
            imageSrc: "./assets/kenji/Attack1.png",
            framesMax: 4
        },
        blockLeft: {
            imageSrc: "./assets/kenji/Fall.png",
            framesMax: 2
        }
    }
});

//The keys used for horizontal movement
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

//Function that checks whether an attack got blocked or not
function isBlocked(attacker, blocker) {
    if (attacker.direction == "right" && blocker.direction == "right" && blocker.isBlocking ||
        attacker.direction == "left" && blocker.direction == "left" && blocker.isBlocking) {
        return true;
    } else {
        return false;
    }
}

//A function that checks which player won the game
function whoWins({ player, enemy, timerId }) {

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

//Constantly call the decrease timer function
decreaseTimer();

//A loop that will run forever and animate the canvas
function animate() {
    window.requestAnimationFrame(animate);
    c.fillStyle = "black";
    c.fillRect(0, 0, canvas.width, canvas.height);
    background.update();
    shop.update();
    player.update();
    enemy.update();

    //Reset x velocity
    player.velocity.x = 0;
    enemy.velocity.x = 0;

    //Only do this stuff if the game is not over
    if (!gameOver) {
        //Player movement
        if (keys.d.pressed && player.lastKey === "d") {
            player.velocity.x = player.speed;
            player.direction = "right";
            player.switchSprites("run");
        } else if (keys.a.pressed && player.lastKey === "a") {
            player.velocity.x = -player.speed;
            player.direction = "left";
            player.switchSprites("run");
        } else {
            player.switchSprites("idle");
        }

        //Enemy movement
        if (keys.ArrowRight.pressed && enemy.lastKey === "ArrowRight") {
            enemy.velocity.x = enemy.speed;
            enemy.direction = "right";
            enemy.switchSprites("run");
        } else if (keys.ArrowLeft.pressed && enemy.lastKey === "ArrowLeft") {
            enemy.velocity.x = -enemy.speed;
            enemy.direction = "left";
            enemy.switchSprites("run");
        } else {
            enemy.switchSprites("idle");
        }

        //Enable the jumping and falling animation for player
        if (player.velocity.y < 0) {
            player.switchSprites("jump");
        } else if (player.velocity.y > 0) {
            player.switchSprites("fall");
        }

        //Enable the jumping and falling animtation for enemy
        if (enemy.velocity.y < 0) {
            enemy.switchSprites("jump");
        } else if (enemy.velocity.y > 0) {
            enemy.switchSprites("fall");
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

//Constantly animate the canvas
animate();

//Check for keypresses and enable movement and attacks
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

//Check for the user letting go of keys
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

    //Enemy attacks are on numpad so uses code instead of key
    switch (event.code) {
        case "Numpad3":
            enemy.isBlocking = false;
            break;
    }
});