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
    constructor({ position,
        velocity,
        speed,
        color,
        rangeSpeed,
        direction,
        imageSrc,
        scale = 1,
        framesMax = 1,
        offset = { x: 0, y: 0 },
        sprites
    }) {
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
                y: 50
            },
            width: 175,
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
                x: 0,
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
        this.frameCurrent = 0;
        this.framesElapsed = 0;
        this.framesHold = 10;
        this.sprites = sprites;

        for (const sprite in this.sprites) {
            sprites[sprite].image = new Image();
            sprites[sprite].image.src = sprites[sprite].imageSrc;
        }
    }

    update() {

        this.draw();

        this.animateFrames();

        if (this.direction == "right") {
            this.attackBox.offset.x = 0;
            this.attackBoxRange.offset.x = 55;
        }
        if (this.direction == "left") {
            this.attackBox.offset.x = 125;
            this.attackBoxRange.offset.x = -55;
        }

        this.attackBox.position.x = this.position.x - this.attackBox.offset.x;
        this.attackBox.position.y = this.position.y + this.attackBox.offset.y;

        c.fillStyle = "orange";
        c.fillRect(this.attackBoxRange.position.x, this.attackBoxRange.position.y, this.attackBoxRange.size, this.attackBoxRange.size);

        c.fillStyle = "green";
        c.fillRect(this.position.x, this.position.y, this.width, this.height);

        c.fillStyle = "purple";
        c.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);

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
            this.position.y = 331;
            this.jumpLimit = jumpLimitGlobal;
        } else {
            this.velocity.y += gravity;
        }
    }

    switchSprites(sprite) {

        if (this.image === this.sprites.attackShort.image && this.frameCurrent < this.sprites.attackShort.framesMax - 1) return;
        if (this.image === this.sprites.attackShortLeft.image && this.frameCurrent < this.sprites.attackShortLeft.framesMax - 1) return;

        if (this.direction === "right" || this.blockDirection === "left") {
            switch (sprite) {
                case "idle":
                    if (this.image !== this.sprites.idle.image) {
                        this.image = this.sprites.idle.image;
                        this.framesMax = this.sprites.idle.framesMax;
                        this.frameCurrent = 0;
                    }
                    break;
                case "run":
                    if (this.image !== this.sprites.run.image) {
                        this.image = this.sprites.run.image;
                        this.framesMax = this.sprites.run.framesMax;
                        this.frameCurrent = 0;
                    }
                    break;
                case "jump":
                    if (this.image !== this.sprites.jump.image) {
                        this.image = this.sprites.jump.image;
                        this.framesMax = this.sprites.jump.framesMax;
                        this.frameCurrent = 0;
                    }
                    break;
                case "fall":
                    if (this.image !== this.sprites.fall.image) {
                        this.image = this.sprites.fall.image;
                        this.framesMax = this.sprites.fall.framesMax;
                        this.frameCurrent = 0;
                    }
                    break;
                case "attackShort":
                    if (this.image !== this.sprites.attackShort.image) {
                        this.image = this.sprites.attackShort.image;
                        this.framesMax = this.sprites.attackShort.framesMax;
                        this.frameCurrent = 0;
                    }
                    break;
            }
        } else if (this.direction === "left" || this.blockDirection === "right") {
            switch (sprite) {
                case "idle":
                    if (this.image !== this.sprites.idleLeft.image) {
                        this.image = this.sprites.idleLeft.image;
                        this.framesMax = this.sprites.idleLeft.framesMax;
                        this.frameCurrent = 0;
                    }
                    break;
                case "run":
                    if (this.image !== this.sprites.runLeft.image) {
                        this.image = this.sprites.runLeft.image;
                        this.framesMax = this.sprites.runLeft.framesMax;
                        this.frameCurrent = 0;
                    }
                    break;
                case "jump":
                    if (this.image !== this.sprites.jumpLeft.image) {
                        this.image = this.sprites.jumpLeft.image;
                        this.framesMax = this.sprites.jumpLeft.framesMax;
                        this.frameCurrent = 0;
                    }
                    break;
                case "fall":
                    if (this.image !== this.sprites.fallLeft.image) {
                        this.image = this.sprites.fallLeft.image;
                        this.framesMax = this.sprites.fallLeft.framesMax;
                        this.frameCurrent = 0;
                    }
                    break;
                case "attackShort":
                    if (this.image !== this.sprites.attackShortLeft.image) {
                        this.image = this.sprites.attackShortLeft.image;
                        this.framesMax = this.sprites.attackShortLeft.framesMax;
                        this.frameCurrent = 0;
                    }
                    break;
            }
        }
    }

    attack() {
        this.switchSprites("attackShort");
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