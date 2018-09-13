WIDTH = 800;
HEIGHT = 640;

class Sprite{

    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}

let canvas = document.createElement('canvas');
canvas.height = HEIGHT;
canvas.width = WIDTH;
let canvasctx = canvas.getContext('2d');
document.body.appendChild(canvas);

//Game content variables
const sprite = new Sprite(WIDTH/2, HEIGHT/2);
let currentInput = {
    left: false,
    right: false,
    up: false,
    down: false,
    space: false
};
let priorInput = {
    left: false,
    right: false,
    up: false,
    down: false,
    space: false
};
let start = null;

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

//update game state
function update(elapsedTime){
    if (currentInput.space && !priorInput.space){
        // TODO: Fire bullet
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
}

//render the world
function render(elapsedTime){
    canvasctx.clearRect(0, 0, WIDTH, HEIGHT);
    canvasctx.fillStyle = '#ff0000';
    canvasctx.fillRect(sprite.x, sprite.y, 20, 20);
}

//main game loop function
function gameloop(timestamp){
    if(!start){
        start = timestamp;
    }
    let elapsedTime = timestamp - start;
    start = timestamp;
    priorInput = currentInput;
    update(elapsedTime);
    render(elapsedTime);
    window.requestAnimationFrame(gameloop);
}

//Start the game loop
window.requestAnimationFrame(gameloop);
