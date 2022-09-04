//Get the canvas and the canvas context
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

//Set the width and height to something good for a game and most devices
canvas.width = 1024;
canvas.height = 576;

//Make the background
c.fillRect(0, 0, canvas.width, canvas.height);

//Gravity constant
const gravity = 0.7;

//The sprite class which has all the sprite properties
class Sprite {
    constructor({ position, velocity, speed, color }) {
        this.position = position;
        this.velocity = velocity;
        this.height = 150;
        this.width = 50;
        this.lastKey;
        this.speed = speed;
        this.attackBox = {
            position: this.position,
            width: 100,
            height: 50
        }
        this.color = color;
    }

    draw() {
        //Draw the players
        c.fillStyle = this.color;
        c.fillRect(this.position.x, this.position.y, this.width, this.height);

        //Draw the attack box
        c.fillStyle = 'purple';
        c.fillRect(this.attackBox.position.x + 25, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);
    }

    update() {
        this.draw();

        this.position.y += this.velocity.y;
        this.position.x += this.velocity.x;

        if (this.position.y + this.height + this.velocity.y >= canvas.height) {
            this.velocity.y = 0;
        } else {
            this.velocity.y += gravity;
        }
    }
}

//Make the player and the enemy
const player = new Sprite({
    position: {
        x: 10,
        y: 0
    },
    velocity: {
        x: 0,
        y: 0.2
    },

    speed: 6,
    color: 'blue'
})

const enemy = new Sprite({
    position: {
        x: 400,
        y: 50
    },
    velocity: {
        x: 0,
        y: 0.2
    },

    speed: 6,
    color: 'red'
})

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
}

let lastKey;

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

    //Player movement
    if (keys.d.pressed && player.lastKey === 'd') {
        player.velocity.x = player.speed;
    } else if (keys.a.pressed && player.lastKey === 'a') {
        player.velocity.x = -player.speed;
    }

    //Enemy movement
    if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
        enemy.velocity.x = enemy.speed;
    } else if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
        enemy.velocity.x = -enemy.speed;
    }

    //Detect for collision
    if (player.attackBox.position.x + player.attackBox.width >= enemy.position.x && 
        player.attackBox.position.x + player.attackBox.width <= enemy.position.x + enemy.width &&
        player.attackBox.position.y + player.attackBox.height >= enemy.position.y &&
        player.attackBox.position.y + player.attackBox.height <= enemy.position.y + enemy.height ||
        player.attackBox.position.x >= enemy.position.x && player.attackBox.position.x <= enemy.position.x + enemy.width) {
        console.log("attack");
    }
}

animate();

window.addEventListener('keydown', (event) => {
    //Player keys
    switch (event.key) {
        case 'd':
            keys.d.pressed = true;
            player.lastKey = 'd';
            break;
        case 'a':
            keys.a.pressed = true;
            player.lastKey = 'a';
            break;
        case 'w':
            player.velocity.y = -17;
            break;
    }

    //Enemy keys
    switch (event.key) {
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true;
            enemy.lastKey = 'ArrowLeft';
            break;
        case 'ArrowRight':
            keys.ArrowRight.pressed = true;
            enemy.lastKey = 'ArrowRight';
            break;
        case 'ArrowUp':
            enemy.velocity.y = -17;
            break;
    }
})

window.addEventListener('keyup', (event) => {
    //Player keys
    switch (event.key) {
        case 'd':
            keys.d.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;
    }

    //Enemy keys
    switch (event.key) {
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
            break;
        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
            break;
    }
})