//Get the canvas and the canvas context
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

//Set the width and height to something good for a game and most devices
canvas.width = 1024;
canvas.height = 576;

//Make the background
c.fillRect(0, 0, canvas.width, canvas.height);

//Gravity constant
const gravity = 0.2;

//The sprite class which has all the sprite properties
class Sprite {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;
        this.height = 150;
        this.width = 50;
        this.lastKey;
    }

    draw() {
        c.fillStyle = 'red';
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
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
    }
})

const enemy = new Sprite({
    position: {
        x: 400,
        y: 50
    },
    velocity: {
        x: 0,
        y: 0.2
    }
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

    player.velocity.x = 0;

    if (keys.d.pressed && lastKey === 'd') {
        player.velocity.x = 3;
    } else if (keys.a.pressed && lastKey === 'a') {
        player.velocity.x = -3;
    }

    
}

animate();

window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = true;
            lastKey = 'd';
            break;
        case 'a':
            keys.a.pressed = true;
            lastKey = 'a';
            break;
        case 'w':
            player.velocity.y = -10;
            break;

        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true;
            lastKey = 'left';
            break;
        case 'ArrowRight':
            keys.ArrowRight.pressed = true;
            lastKey = 'right';
            break;
        case 'ArrowUp':
            player.velocity.y = -10;
            break;

        default:
            console.log("random key pressed down lawl");
    }
})

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
            break;
        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
            break;
    }
})