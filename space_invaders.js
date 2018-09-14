//WORLD CONSTANTS
const WIDTH = 800;
const HEIGHT = 640;

//BULLET CONSTANTS
const bulletSpeed = 0.5;
const bulletSize = 8;

//SPRITE CONSTANTS
const spriteBulletLimit = 5;
let spriteLives = 5;

//ENEMY CONSTANTS
const enemyBulletLimit = 1;
const enemySpeed = 0.05;
const enemyRotationSpeed = Math.PI / 240;
const createEnemyTime = [300, 1000];
const enemyShootTime = [500, 2000];
const enemyValue = 10;
const enemySize = 50;
let createEnemy = getRndInteger(createEnemyTime[0], createEnemyTime[1]);

class Object {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}

class Sprite extends Object {

    constructor(x, y, w, h, lives) {
        super(x, y, w, h);
        this.bullets = [];
        this.lives = lives;
        this.score = 0;
    }

    shoot() {
        if (this.bullets.length > spriteBulletLimit - 1) {
            console.log('Sprite cannot shoot more than 3 bullets')
        } else {
            this.bullets.push(new Bullet(this.x, this.y, bulletSize, bulletSize));
        }

    }
}

class Bullet extends Object {

    constructor(x, y, w, h) {
        super(x, y, w, h);
    }
}

class Enemy extends Object {
    constructor(x, y, w, h, rotation, speed, shootingReload, value) {
        super(x, y, w, h);
        this.rotation = rotation;
        this.speed = speed;
        this.bullets = [];
        this.shootingReload = shootingReload;
        this.lastShootingTime = 0;
        this.value = value;
    }

    shoot(elapsedTime) {
        if (this.bullets.length < enemyBulletLimit && this.lastShootingTime > this.shootingReload) {
            this.bullets.push(new Bullet(this.x, this.y, bulletSize, bulletSize));
            this.lastShootingTime = 0;
        } else {
            this.lastShootingTime += elapsedTime;
        }

    }
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

//Double buffer
let canvasBuffer = document.createElement('canvas');
canvasBuffer.height = HEIGHT;
canvasBuffer.width = WIDTH;
let canvasctxBuffer = canvasBuffer.getContext('2d');

let canvas = document.createElement('canvas');
canvas.height = HEIGHT;
canvas.width = WIDTH;
let canvasctx = canvas.getContext('2d');
document.body.appendChild(canvas);


//Game content variables and init function to reset game
var currentInput = null;
var priorInput = null;
var start = null;
var gameOver = null;
var enemies = null;
var TimeNewEnemy = null;
var sprite = null;

function init(){
    //Game content variables
    currentInput = {
        left: false,
        right: false,
        up: false,
        down: false,
        space: false
    };
    priorInput = {
        left: false,
        right: false,
        up: false,
        down: false,
        space: false
    };
    start = null;
    gameOver = false;
    enemies = [];
    TimeNewEnemy = 0;

    sprite = new Sprite(WIDTH / 2, HEIGHT, 20, 20, spriteLives);
}

init();

function handleKeyDown(event) {
    switch (event.key) {
        case ' ':
            currentInput.space = true;
            break;
        case 'ArrowUp':
            currentInput.up = true;
            break;
        case 'ArrowDown':
            currentInput.down = true;
            break;
        case 'ArrowRight':
            currentInput.right = true;
            break;
        case 'ArrowLeft':
            currentInput.left = true;
        case 'r':
            if (gameOver){
                gameOver = false;
                init();
                window.requestAnimationFrame(gameloop);
            }
    }
}

function handleKeyUp(event) {
    switch (event.key) {
        case ' ':
            currentInput.space = false;
            break;
        case 'ArrowUp':
            currentInput.up = false;
            break;
        case 'ArrowDown':
            currentInput.down = false;
            break;
        case 'ArrowRight':
            currentInput.right = false;
            break;
        case 'ArrowLeft':
            currentInput.left = false;
            break;
    }
}

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

//detect colisions of bullet and object
function collision(object1, object2) {
    if (object1.x <= object2.x && object1.y <= object2.y && object1.x + object1.w >= object2.x && object1.y + object1.h >= object2.y) {
        return true;
    }
    if (object1.x <= object2.x && object1.y >= object2.y && object1.x + object1.w >= object2.x && object2.y + object2.h >= object1.y) {
        return true;
    }
    if (object1.x >= object2.x && object1.y <= object2.y && object2.x + object2.w >= object1.x && object1.y + object1.h >= object2.y) {
        return true;
    }
    return object1.x >= object2.x && object1.y >= object2.y && object2.x + object2.w >= object1.x && object2.y + object2.h >= object1.y;
}

//update game state
function update(elapsedTime) {
    if (currentInput.space && !priorInput.space) {
        sprite.shoot();
    }
    if (currentInput.left) {
        sprite.x -= 0.2 * elapsedTime;
    }
    if (currentInput.right) {
        sprite.x += 0.2 * elapsedTime;
    }
    if (currentInput.up) {
        sprite.y -= 0.1 * elapsedTime;
    }
    if (currentInput.down) {
        sprite.y += 0.1 * elapsedTime;
    }

    //Detecting collisions between sprite bullets and enemies
    sprite.bullets.forEach(function (bullet, indexBullet) {
        enemies.forEach(function (enemy, indexEnemy) {
            if (collision(bullet, enemy)) {
                sprite.score += enemy.value;
                sprite.bullets.splice(indexBullet, 1);
                enemies.splice(indexEnemy, 1);
            }
        });
    });

    //Detecting collision between enemies bullets and sprites
    enemies.forEach(function (enemy) {
        enemy.bullets.forEach(function (bullet, index) {
            if (collision(bullet, sprite)) {
                sprite.lives -= 1;
                enemy.bullets.splice(index, 1);
            }
        });
    });

    //Moving with bullets from Sprite
    sprite.bullets.forEach(function (bullet, index) {
        bullet.y -= bulletSpeed * elapsedTime;
        if (bullet.y < 0) {
            sprite.bullets.splice(index, 1);
        }
    });

    //Moving with bullets from Enemies
    enemies.forEach(function (enemy) {
        enemy.shoot(elapsedTime);
        enemy.bullets.forEach(function (bullet, index) {
            bullet.y += bulletSpeed * elapsedTime;
            if (bullet.y > HEIGHT) {
                enemy.bullets.splice(index, 1);
            }
        });
    });

    //Creating new enemies
    if (TimeNewEnemy > createEnemy) {
        enemies.push(new Enemy(WIDTH / 2, 0, enemySize, enemySize, enemyRotationSpeed, enemySpeed, getRndInteger(enemyShootTime[0], enemyShootTime[1]), enemyValue));
        TimeNewEnemy = 0;
        createEnemy = getRndInteger(createEnemyTime[0], createEnemyTime[1]);
    } else {
        TimeNewEnemy += elapsedTime;
    }

    //Enemies movement
    enemies.forEach(function (enemy, index) {
        enemy.rotation += enemyRotationSpeed;
        enemy.x = Math.sin(enemy.rotation) * WIDTH / 2 + WIDTH / 2;
        enemy.y += enemySpeed * elapsedTime;
        if(enemy.y + enemy.h > HEIGHT){
            sprite.lives -= 1;
            enemies.splice(index, 1);

        }
    });

    //Checking for sprite lives
    return sprite.lives > -1;
}

//render the world
function render() {
    canvasctxBuffer.clearRect(0, 0, WIDTH, HEIGHT);
    canvasctxBuffer.fillStyle = '#FF0000';
    canvasctxBuffer.fillRect(sprite.x, sprite.y - sprite.h, sprite.w, sprite.h);

    sprite.bullets.forEach(function (bullet) {
        canvasctxBuffer.fillStyle = '#6047FF';
        canvasctxBuffer.fillRect(bullet.x, bullet.y, bullet.w, bullet.h);
    });

    enemies.forEach(function (enemy) {
        canvasctxBuffer.fillStyle = '#48FF00';
        canvasctxBuffer.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
        enemy.bullets.forEach(function (bullet) {
            canvasctxBuffer.fillStyle = '#6047FF';
            canvasctxBuffer.fillRect(bullet.x, bullet.y, bullet.w, bullet.h);
        })
    });

    canvasctxBuffer.font = "20px Arial";
    canvasctxBuffer.fillStyle = "#000000";
    canvasctxBuffer.fillText("Lives: "+sprite.lives,WIDTH-100,HEIGHT-5);

    canvasctxBuffer.font = "20px Arial";
    canvasctxBuffer.fillStyle = "#000000";
    canvasctxBuffer.fillText("Score: "+sprite.score,WIDTH-100,HEIGHT-25);
}

//main game loop function
function gameloop(timestamp) {
    if (!start) {
        start = timestamp;
    }
    let elapsedTime = timestamp - start;
    start = timestamp;
    let res = update(elapsedTime);
    render(elapsedTime);

    // Double buffering
    canvasctx.fillStyle = '#FFFFFF';
    canvasctx.fillRect(0, 0, WIDTH, HEIGHT);
    canvasctx.drawImage(canvasBuffer,0,0);

    priorInput = JSON.parse(JSON.stringify(currentInput));
    if (res){
        window.requestAnimationFrame(gameloop);
    } else{
        gameOver = true;
        sprite = null;
        canvasctx.fillStyle = '#000000';
        canvasctx.font = "40px Arial";
        canvasctx.fillText("Game Over", WIDTH/2-WIDTH/7,HEIGHT/2);
        canvasctx.fillText("Press 'r' for game restart", WIDTH/2-WIDTH/4,HEIGHT/2+HEIGHT/7);
    }
}

//Start the game loop
window.requestAnimationFrame(gameloop);
