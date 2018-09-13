const WIDTH = 800;
const HEIGHT = 640;
const bulletSpeed = 0.5;
const bulletLimit = 3;
const enemySpeed = 0.05;
const enemyRotationSpeed = Math.PI/240;
const createEnemy = 1000;

class Sprite{

    constructor(x, y, w, h){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.bullets = [];
    }

    shoot(){
        if (this.bullets.length > bulletLimit-1){
            console.log('Sprite cannot shoot more than 3 bullets')
        } else {
            this.bullets.push(new Bullet(this.x, this.y, 5, 5));
        }

    }
}

class Bullet{
    constructor(x, y, w, h){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}

class Enemy{
    constructor(x, y, w, h, rotation, speed){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.rotation = rotation;
        this.speed = speed;
    }
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}

let canvas = document.createElement('canvas');
canvas.height = HEIGHT;
canvas.width = WIDTH;
let canvasctx = canvas.getContext('2d');
document.body.appendChild(canvas);

//Game content variables
var currentInput = {
    left: false,
    right: false,
    up: false,
    down: false,
    space: false
};
var priorInput = {
    left: false,
    right: false,
    up: false,
    down: false,
    space: false
};
var start = null;
var enemies = [];
var TimeNewEnemy = 0;

var sprite = new Sprite(WIDTH/2, HEIGHT, 20, 20);
enemies.push(new Enemy(WIDTH/2,0,15,15,enemyRotationSpeed,enemySpeed));

function handleKeyDown(event){
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
    }
}

function handleKeyUp(event){
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
function collision(bullet, object){
    if (bullet.x <= object.x && bullet.y <= object.y && bullet.x + bullet.w >= object.x && bullet.y + bullet.h >= object.y) {
        return true;
    }
    if (bullet.x <= object.x && bullet.y >= object.y && bullet.x + bullet.w >= object.x && object.y + object.h >= bullet.y){
        return true;
    }
    if (bullet.x >= object.x && bullet.y <= object.y && object.x + object.w >= bullet.x && bullet.y + bullet.h >= object.y){
        return true;
    }
    return bullet.x >= object.x && bullet.y >= object.y && object.x + object.w >= bullet.x && object.y + object.h >= bullet.y;
}

//update game state
function update(elapsedTime){
    if (currentInput.space && !priorInput.space){
        sprite.shoot();
    }
    if (currentInput.left){
        sprite.x -= 0.2*elapsedTime;
    }
    if (currentInput.right){
        sprite.x += 0.2*elapsedTime;
    }
    if (currentInput.up){
        sprite.y -= 0.1*elapsedTime;
    }
    if (currentInput.down){
        sprite.y += 0.1*elapsedTime;
    }

    sprite.bullets.forEach(function (bullet, indexBullet) {
        enemies.forEach(function (enemy, indexEnemy) {
            if (collision(bullet, enemy)){
                console.log(bullet.x, bullet.y, bullet.w, bullet.h, enemy.x, enemy.y, enemy.w, enemy.h);
                sprite.bullets.splice(indexBullet, 1);
                enemies.splice(indexEnemy, 1);
            }
        });
    });

    sprite.bullets.forEach(function (bullet, index) {
       bullet.y -= bulletSpeed*elapsedTime;
       //console.log(bullet.y, 'bullet');
       if (bullet.y < 0){
           sprite.bullets.splice(index, 1);
       }
    });

    if (TimeNewEnemy > createEnemy){
        enemies.push(new Enemy(WIDTH/2,0,15,15,enemyRotationSpeed,enemySpeed));
        TimeNewEnemy = 0;
    }else{
        TimeNewEnemy += elapsedTime;
    }

    enemies.forEach(function (enemy){
        enemy.rotation += enemyRotationSpeed;
        enemy.x = Math.sin(enemy.rotation)*WIDTH/2 + WIDTH/2;
        enemy.y += enemySpeed*elapsedTime;
        console.log(enemy.y)
    });
}

//render the world
function render(elapsedTime){
    canvasctx.clearRect(0, 0, WIDTH, HEIGHT);
    canvasctx.fillStyle = '#FF0000';
    canvasctx.fillRect(sprite.x, sprite.y-sprite.h, sprite.w, sprite.h);

    sprite.bullets.forEach(function(bullet) {
        canvasctx.fillStyle = '#6047FF';
        canvasctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h);
    });

    enemies.forEach(function (enemy) {
        canvasctx.fillStyle = '#48FF00';
        canvasctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
    });
}

//main game loop function
function gameloop(timestamp){
    if(!start){
        start = timestamp;
    }
    let elapsedTime = timestamp - start;
    start = timestamp;
    update(elapsedTime);
    render(elapsedTime);
    priorInput = JSON.parse(JSON.stringify(currentInput));
    window.requestAnimationFrame(gameloop);
}

//Start the game loop
window.requestAnimationFrame(gameloop);
