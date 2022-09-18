//The sprite class for making sprites easily
class Sprite {
    constructor({ position, imageSrc, scale = 1, framesMax = 1, offset = { x: 0, y: 0 } }) {
        this.position = position;
        this.height = 150;
        this.width = 50;
        this.image = new Image();
        this.image.src = imageSrc;
        this.scale = scale;
        this.framesMax = framesMax;
        this.frameCurrent = 0;
        this.framesElapsed = 0;
        this.framesHold = 10;
        this.offset = offset;
    }

    draw() {
        c.drawImage(
            this.image,
            this.frameCurrent * (this.image.width / this.framesMax),
            0,
            this.image.width / this.framesMax,
            this.image.height,
            this.position.x - this.offset.x,
            this.position.y - this.offset.y,
            (this.image.width / this.framesMax) * this.scale,
            this.image.height * this.scale
        );



    }

    update() {
        this.draw();
        this.animateFrames();

    }

    animateFrames() {
        this.framesElapsed++;
        if (this.framesElapsed % this.framesHold === 0) {
            if (this.frameCurrent < this.framesMax - 1) {
                this.frameCurrent++;
            } else {
                this.frameCurrent = 0;
            }
        }
    }
}

//The fighter class to make making fighters easy
class Fighter extends Sprite {
    constructor({ position, velocity, speed, color, rangeSpeed, direction, imageSrc, scale = 1, framesMax = 1, offset = { x: 0, y: 0 } }) {
        super({
            position,
            imageSrc,
            scale,
            framesMax,
            offset
        });

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
            offset: {
                x: 0,
                y: 0
            },
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

        };
        this.isAttackingRange = false;
        this.rangeAttackRecharge = false;
        this.rechargeTime = 3000;
        this.jumpLimit = jumpLimitGlobal;
        this.health = 100;
        this.isBlocking = false;
        this.direction = direction;
        this.frameCurrent = 0;
        this.framesElapsed = 0;
        this.framesHold = 10;
    }

    update() {

        this.draw();

        this.animateFrames();

        if (this.direction == "right") {
            this.attackBox.offset.x = 0;

        }
        if (this.direction == "left") {
            this.attackBox.offset.x = 50;

        }

        this.attackBox.position.x = this.position.x - this.attackBox.offset;
        this.attackBox.position.y = this.position.y;

        if (!this.isAttackingRange) {
            this.attackBoxRange.position.x = this.position.x;
            this.attackBoxRange.position.y = this.position.y;

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

        //Make gravity affect the players
        if (this.position.y + this.height + this.velocity.y >= canvas.height - 95) {
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