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

//Jump limit
const jumpLimitGlobal = 2;

//The sprite class which has all the sprite properties
class Sprite {
    constructor({ position, velocity, speed, color, offset, rangeSpeed }) {
        this.position = position;
        this.velocity = velocity;
        this.height = 150;
        this.width = 50;
        this.lastKey = '';
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
            offset: 25
        };
        this.isAttackingRange = false;
        this.rangeAttackRecharge = false;
        this.rechargeTime = 3000;
        this.jumpLimit = jumpLimitGlobal;
    }

    draw() {

        //Draw the players
        c.fillStyle = this.color;
        c.fillRect(this.position.x, this.position.y, this.width, this.height);


        //Draw the attack box
        if (this.isAttacking) {
            c.fillStyle = 'purple';
            c.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);
        }

        if (this.isAttackingRange) {
            c.fillStyle = 'orange';
            c.fillRect(this.attackBoxRange.position.x, this.attackBoxRange.position.y, this.attackBoxRange.size, this.attackBoxRange.size);

        }

    }

    update() {

        this.draw();

        this.attackBox.position.x = this.position.x - this.attackBox.offset.x;
        this.attackBox.position.y = this.position.y;

        if (!this.isAttackingRange) {
            this.attackBoxRange.position.x = this.position.x;
            this.attackBoxRange.position.y = this.position.y + this.attackBoxRange.offset;
        } else if (this.isAttackingRange) {
            this.attackBoxRange.position.x += this.attackBoxRange.speed;

        }

        if (this.attackBoxRange.position.x + this.attackBoxRange.size >= canvas.width ||
            this.attackBoxRange.position.x <= 0) {
            this.isAttackingRange = false;
        }

        this.position.y += this.velocity.y;
        this.position.x += this.velocity.x;

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
    color: 'blue',
    offset: {
        x: 0,
        y: 0
    },
    rangeSpeed: 7
});

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
    color: 'red',
    offset: {
        x: 50,
        y: 0
    },
    rangeSpeed: -7
});

function attackCollision({ rectangle1, rectangle2 }, type) {
    if (type === 'short') {
        return (
            rectangle1.attackBox.position.x + rectangle1.attackBox.width >= rectangle2.position.x &&
            rectangle1.attackBox.position.x <= rectangle2.position.x + rectangle2.width &&
            rectangle1.attackBox.position.y + rectangle1.attackBox.height >= rectangle2.position.y &&
            rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
        );
    } else if (type === 'long') {
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

    //Detect for short range collision player
    if (attackCollision({ rectangle1: player, rectangle2: enemy }, 'short') &&
        player.isAttacking) {

        player.isAttacking = false;
        console.log("attack on enemy");
    }

    //Detect for long range collision player
    if (attackCollision({ rectangle1: player, rectangle2: enemy }, 'long') &&
        player.isAttackingRange) {

        player.isAttackingRange = false;
        console.log("attack on enemy");
    }

    //Detect for short range collision enemy
    if (attackCollision({ rectangle1: enemy, rectangle2: player }, 'short') &&
        enemy.isAttacking) {

        enemy.isAttacking = false;
        console.log("attack on player");
    }

    //Detect for long range collision enemy
    if (attackCollision({ rectangle1: enemy, rectangle2: player }, 'long') &&
        enemy.isAttackingRange) {

        enemy.isAttackingRange = false;
        console.log("attack on player");
    }
}

animate();

window.addEventListener('keydown', (event) => {

    //console.log(event.key + ", " + event.code);

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
            player.jump();
            break;
        case 'j':
            player.attack();
            break;
        case 'k':
            player.attackRange();
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
            enemy.jump();
            break;
    }

    //Enemy attacks are on numpad so it should use code so it can be used with or without numlock
    switch (event.code) {
        case 'Numpad1':
            enemy.attack();
            break;
        case 'Numpad2':
            enemy.attackRange();
            break;
    }
});

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
});