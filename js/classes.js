//The sprite class for making sprites easily
class Sprite {
    constructor({ position, imageSrc, scale = 1, framesMax = 1 }) {
        this.position = position;
        this.height = 150;
        this.width = 50;
        this.image = new Image();
        this.image.src = imageSrc;
        this.scale = scale;
        this.framesMax = framesMax;
        this.frameCurrent = 0;
        this.framesElapsed = 0;
        this.framesHold = 1;
    }

    draw() {
        c.drawImage(
            this.image,
            this.frameCurrent * (this.image.width / this.framesMax),
            0,
            this.image.width / this.framesMax,
            this.image.height,
            this.position.x,
            this.position.y,
            (this.image.width / this.framesMax) * this.scale,
            this.image.height * this.scale
        );


    }

    update() {
        this.draw();
        if (this.frameCurrent < this.framesMax - 1) {
            this.frameCurrent++;
        } else {
            this.frameCurrent = 0;
        }
    }
}

//The fighter class to make making fighters easy
class Fighter {
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