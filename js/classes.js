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

    //This is what draws the images onto the canvas
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

    //This is run constantly to animate the canvas
    update() {
        this.draw();
        this.animateFrames();
    }

    //This is in charge of changing all the frames and creating animations
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

//The fighter class to make creating fighters easy
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
        sprites,
        rangeDamage,
        damage,
        rangeCooldown
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
            width: 225,
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
        this.rechargeTime = rangeCooldown;
        this.jumpLimit = jumpLimitGlobal;
        this.health = 100;
        this.isBlocking = false;
        this.blockDirection = "";
        this.shootDirection = "";
        this.direction = direction;
        this.frameCurrent = 0;
        this.framesElapsed = 0;
        this.framesHold = 10;
        this.sprites = sprites;
        this.gotDeflected = false;
        this.energy = 100;
        this.energyCooldown = 3000;
        this.rechargingEnergy = false;
        this.rangeDamage = rangeDamage;
        this.damage = damage;

        for (const sprite in this.sprites) {
            sprites[sprite].image = new Image();
            sprites[sprite].image.src = sprites[sprite].imageSrc;
        }
    }

    //Update is being run all the time so all calculations are done here
    update() {

        //Draw the sprites onto the canvas and animate them
        this.draw();
        this.animateFrames();

        //Change offsets depending on direction so players can attack in both directions
        if (this.direction == "right") {
            player.attackBox.offset.x = 0;
            enemy.attackBox.offset.x = -35;
            this.attackBoxRange.offset.x = 55;
        }
        if (this.direction == "left") {
            enemy.attackBox.offset.x = 200;
            player.attackBox.offset.x = 50;
            this.attackBoxRange.offset.x = -55;
        }

        //Update the position of the attack box
        this.attackBox.position.x = this.position.x - this.attackBox.offset.x;
        this.attackBox.position.y = this.position.y + this.attackBox.offset.y;

        //This is used to draw the hitboxes

        //Range attack
        c.fillStyle = "orange";
        c.fillRect(this.attackBoxRange.position.x, this.attackBoxRange.position.y, this.attackBoxRange.size, this.attackBoxRange.size);

        //Player hitboxes
        // c.fillStyle = "green";
        // c.fillRect(this.position.x, this.position.y, this.width, this.height);

        //Short range attack
        // c.fillStyle = "purple";
        // c.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);

        //Update the position of the ranged attack box
        if (!this.isAttackingRange) {
            this.attackBoxRange.position.x = this.position.x + this.attackBoxRange.offset.x;
            this.attackBoxRange.position.y = this.position.y + this.attackBoxRange.offset.y;
            this.shootDirection = this.direction;
            this.gotDeflected = false;

            if (this.direction == "right") {
                if (this === player) {
                    player.attackBoxRange.speed = 10;
                } else {
                    enemy.attackBoxRange.speed = 7;
                }

            } else if (this.direction == "left") {
                if (this === player) {
                    player.attackBoxRange.speed = -10;
                } else {
                    enemy.attackBoxRange.speed = -7;
                }
            }
            //If the player has shot the long range attack it should stop following the player and shoot out
        } else if (this.isAttackingRange) {
            this.attackBoxRange.position.x += this.attackBoxRange.speed;

        }

        //If the ranged attack box goes off screen delete it
        if (this.attackBoxRange.position.x + this.attackBoxRange.size >= canvas.width ||
            this.attackBoxRange.position.x <= 0) {
            this.isAttackingRange = false;
        }

        //If they are already blocking when they run out of energy
        if (this.isBlocking && this.energy <= 0) {
            this.isBlocking = false;
        }

        //If the players are blocking make them move slower
        if (!this.isBlocking) {
            this.position.y += this.velocity.y;
            this.position.x += this.velocity.x;
        } else {
            this.position.y += this.velocity.y / 2;
            this.position.x += this.velocity.x / 2;

            if (this.direction === "right") {
                this.blockDirection = "left";
            } else if (this.direction === "left") {
                this.blockDirection = "right";
            }
        }

        this.changeEnergy();

        //Make gravity affect the players
        if (this.position.y + this.height + this.velocity.y >= canvas.height - 95) {
            this.velocity.y = 0;
            this.position.y = 331;
            this.jumpLimit = jumpLimitGlobal;
        } else {
            this.velocity.y += gravity;
        }
    }

    //A function used to switch to the proper animation at the correct time
    switchSprites(sprite) {

        //If the attack animations are not finished do not interrupt them
        if (this.image === this.sprites.attackShort.image && this.frameCurrent < this.sprites.attackShort.framesMax - 1) return;
        if (this.image === this.sprites.attackShortLeft.image && this.frameCurrent < this.sprites.attackShortLeft.framesMax - 1) return;

        if (this.image === this.sprites.takeHit.image && this.frameCurrent < this.sprites.takeHit.framesMax - 1) return;
        if (this.image === this.sprites.takeHitLeft.image && this.frameCurrent < this.sprites.takeHitLeft.framesMax - 1) return;

        //For animations facing right
        if (this.direction === "right") {

            if (!this.isBlocking) {
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
                    case "takeHit":
                        if (this.image !== this.sprites.takeHit.image) {
                            this.image = this.sprites.takeHit.image;
                            this.framesMax = this.sprites.takeHit.framesMax;
                            this.frameCurrent = 0;
                        }
                        break;
                }
            } else {
                switch (sprite) {
                    case "block":
                        if (this.image !== this.sprites.blockLeft.image) {
                            this.image = this.sprites.blockLeft.image;
                            this.framesMax = this.sprites.blockLeft.framesMax;
                            this.frameCurrent = 0;
                        }
                }
            }
            //For animations facing left
        } else if (this.direction === "left") {
            if (!this.isBlocking) {
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
                    case "takeHit":
                        if (this.image !== this.sprites.takeHitLeft.image) {
                            this.image = this.sprites.takeHitLeft.image;
                            this.framesMax = this.sprites.takeHitLeft.framesMax;
                            this.frameCurrent = 0;
                        }
                        break;
                }
            } else {
                switch (sprite) {
                    case "block":
                        if (this.image !== this.sprites.block.image) {
                            this.image = this.sprites.block.image;
                            this.framesMax = this.sprites.block.framesMax;
                            this.frameCurrent = 0;
                        }
                }
            }
        }
    }

    //Enables the players to do a short range attack
    attack() {
        this.switchSprites("attackShort");
        this.isAttacking = true;
        setTimeout(() => {
            this.isAttacking = false;
        }, 100);
    }

    //Enables the players to do a long range attack
    attackRange() {
        if (!this.isAttackingRange && !this.rangeAttackRecharge && this.energy >= 30) {
            this.isAttackingRange = true;
            this.rangeAttackRecharge = true;
            this.energy -= 30;
            setTimeout(() => {
                this.rangeAttackRecharge = false;
            }, this.rechargeTime)
        }
    }

    //Function for jumping used for counting the max amount of jumps
    jump() {
        if (this.jumpLimit > 0) {
            this.velocity.y = -17;
            this.jumpLimit--;
        }
    }

    //Block function
    block() {
        if (!this.rechargingEnergy && this.energy > 0) {
            this.isBlocking = true;
        } else {
            this.isBlocking = false;
        }
    }

    //A function to change the energy
    changeEnergy() {

        if (this.isBlocking) {
            this.energy -= 0.5;
        }

        if (this.isAttackingRange) {
            this.rechargingEnergy = false;
        }

        if (this.rechargingEnergy && this.energy < 100) {
            this.energy += 0.75;
        } else {
            this.rechargingEnergy = false;
            this.energyRecharge(this.energy);
        }

        if (this.energy > 100) {
            this.energy = 100;
        }
    }

    energyRecharge(checkEnergy) {
        setTimeout(() => {
            if (this.energy === checkEnergy && this.energy < 100) {
                this.rechargingEnergy = true;
            }
        }, this.energyCooldown)
    }

    takeHit(amount) {
        this.health -= amount;
        this.switchSprites("takeHit");

        if(this.health < 0) {
            this.health = 0;
        }
    }
}