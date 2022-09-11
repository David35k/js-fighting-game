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

//The sprite class which has all the sprite properties
class Sprite {
    constructor({ position, velocity, speed, color, offset, rangeSpeed, direction }) {
        this.position = position;
        this.velocity = velocity;
        this.height = 150;
        this.width = 50;
        this.lastKey = "";
        this.speed = speed;
        this.attackBox = {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            offset,
            width: 100,
            height: 50
        };
        this.color = color;
        this.isAttacking = false;
        this.attackBoxRange = {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            size: 50,
            speed: rangeSpeed,
            offset: {
                x: 50,
                y: 25
            }
        };
        this.isAttackingRange = false;
        this.rangeAttackRecharge = false;
        this.rechargeTime = 3000;
        this.jumpLimit = jumpLimitGlobal;
        this.health = 100;
        this.isBlocking = false;
        this.direction = direction;
    }

    draw() {

        //Draw the players
        c.fillStyle = this.color;
        c.fillRect(this.position.x, this.position.y, this.width, this.height);


        //Draw the attack box
        if (this.isAttacking) {
            c.fillStyle = "purple";
            c.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);
        }

        if (this.isAttackingRange) {
            c.fillStyle = "orange";
            c.fillRect(this.attackBoxRange.position.x, this.attackBoxRange.position.y, this.attackBoxRange.size, this.attackBoxRange.size);

        }

    }

    update() {

        this.draw();

        if (this.direction == "right") {
            this.attackBox.offset.x = 0;
            this.attackBoxRange.offset.x = 60;
        } else if (this.direction == "left") {
            this.attackBox.offset.x = 50;
            this.attackBoxRange.offset.x = -60;
        }

        this.attackBox.position.x = this.position.x - this.attackBox.offset.x;
        this.attackBox.position.y = this.position.y;

        if (!this.isAttackingRange) {
            this.attackBoxRange.position.x = this.position.x + this.attackBoxRange.offset.x;
            this.attackBoxRange.position.y = this.position.y + this.attackBoxRange.offset.y;

            if (this.direction == "right") {
                this.attackBoxRange.speed = 7;
            } else if (this.direction == "left") {
                this.attackBoxRange.speed = -7;
            }

        } else if (this.isAttackingRange) {
            this.attackBoxRange.position.x += this.attackBoxRange.speed;

        }

        if (this.attackBoxRange.position.x + this.attackBoxRange.size >= canvas.width ||
            this.attackBoxRange.position.x <= 0) {
            this.isAttackingRange = false;
        }

        if (!this.isBlocking) {
            this.position.y += this.velocity.y;
            this.position.x += this.velocity.x;
        } else {
            this.position.y += this.velocity.y;
            this.position.x += this.velocity.x / 2;
        }

        if (this.position.y + this.height + this.velocity.y >= canvas.height) {
            this.velocity.y = 0;
            this.jumpLimit = jumpLimitGlobal;
        } else {
            this.velocity.y += gravity;
        }

    }

    attack() {
        this.isAttacking = true;
        setTimeout(() => {
            this.isAttacking = false;
        }, 100);
    }

    attackRange() {
        if (!this.isAttackingRange && !this.rangeAttackRecharge) {
            this.isAttackingRange = true;
            this.rangeAttackRecharge = true;
            setTimeout(() => {
                this.rangeAttackRecharge = false;
            }, this.rechargeTime)
        }

    }

    jump() {
        if (this.jumpLimit > 0) {
            this.velocity.y = -17;
            this.jumpLimit--;
        }
    }

    block() {
        this.isBlocking = true;
    }
}

//Make the player and the enemy
const player = new Sprite({
    position: {
        x: 80,
        y: 0
    },
    velocity: {
        x: 0,
        y: 0.2
    },

    speed: 6,
    color: "blue",
    offset: {
        x: 0,
        y: 0
    },
    rangeSpeed: 7,
    direction: "right"
});

const enemy = new Sprite({
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
    offset: {
        x: 50,
        y: 0
    },
    rangeSpeed: -7,
    direction: "left"

});

function attackCollision({ rectangle1, rectangle2 }, type) {
    if (type === "short") {
        return (
            rectangle1.attackBox.position.x + rectangle1.attackBox.width >= rectangle2.position.x &&
            rectangle1.attackBox.position.x <= rectangle2.position.x + rectangle2.width &&
            rectangle1.attackBox.position.y + rectangle1.attackBox.height >= rectangle2.position.y &&
            rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
        );
    } else if (type === "long") {
        return (
            rectangle1.attackBoxRange.position.x + rectangle1.attackBoxRange.size >= rectangle2.position.x &&
            rectangle1.attackBoxRange.position.x <= rectangle2.position.x + rectangle2.width &&
            rectangle1.attackBoxRange.position.y + rectangle1.attackBoxRange.size >= rectangle2.position.y &&
            rectangle1.attackBoxRange.position.y <= rectangle2.position.y + rectangle2.height
        );
    }
}

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

let timerId;

//Changing the timer
function decreaseTimer() {
    if (!gameOver) {
        if (timer > 0) {
            timerId = setTimeout(decreaseTimer, 1000);
            timer--;
            timeText.innerHTML = timer;
        }

        //End game based on time. Whoever has more health wins
        if (timer === 0) {
            whoWins({ player, enemy });
        }
    }

}

decreaseTimer();

//A loop that will run forever and animate the canvas
function animate() {
    window.requestAnimationFrame(animate);
    c.fillStyle = "black";
    c.fillRect(0, 0, canvas.width, canvas.height);
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

    //console.log(event.key + ", " + event.code);

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