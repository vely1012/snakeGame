class GameObject {
    static renderCallback() { }

    constructor(x, y, skin) {
        this.x = x;
        this.y = y;
        this.position = {
            x: this.x,
            y: this.y
        }
        this.skin = skin;
    }

    render(x=this.x, y=this.y, graphics=this.skin) {
        GameObject.renderCallback(x, y, graphics);
        // let cell = getDisplayCell(this.x, this.y);
        // cell.style.setProperty('background-image', `url(${this.skin})`);
    }

    move(x, y) {
        this.x = x;
        this.y = y;
    }
}

class SnakeObject extends GameObject {
    constructor(x=0, y=0, startingLength=3, initialDirection="right") {
        super(x, y, "./sources/svg/snake_head.svg");
        this.currentDirection = initialDirection;
        this.segments = [];
        // this.segments = new Map();
        for (let i = 0; i < startingLength - 1; i++) {
            // this.segments.push(new GameObject(headX, headY + 1 + i, "./sources/svg/snake_segment.svg"));
            // this.segments.set(newSegment.position, newSegment);
            // this.segments.push({ x: headX, y: headY + 1 + i});
            this.elongate();
            this.render();
        }
        this.eatFoodCallback = f => f;
        this.collideCallback = f => f;
    }

    render() {
        for (let s of this.segments) {
            super.render(s.x, s.y, "./sources/svg/snake_segment.svg");
        }
        super.render();
    }

    move(direction) {
        this.currentDirection = direction;
        let lastPos = this.segments[this.segments.length - 1];
        clearDisplayCell(lastPos.x, lastPos.y);

        for (let i = this.segments.length - 1; i > 0; i--) {
        // for (let i = 0; i < this.segments.length - 1; i++) {
            // let pos = this.segments[i - 1];
            // this.segments[i].move(pos.x, pos.y);
            this.segments[i].x = this.segments[i - 1].x;
            this.segments[i].y = this.segments[i - 1].y;
        }
        // this.segments[0].move(this.x, this.y);
        this.segments[0].x = this.x;
        this.segments[0].y = this.y;
        switch (direction) {
            case 'up':
                this.y--;
                break;
            case 'right':
                this.x++;
                break;
            case 'down':
                this.y++;
                break;
            case 'left':
                this.x--;
                break;
        }
        // this.render();
    }

    elongate() {
        this.segments.unshift({ x: this.x, y: this.y });

        switch(this.currentDirection) {
            case 'up':
                this.y--;
                break;
            case 'right':
                this.x++;
                break;
            case 'down':
                this.y++;
                break;
            case 'left':
                this.x--;
                break;
        }
    }

    checkSelfCollision() {
        for (let s of this.segments) {
            if (this.x === s.x && this.y === s.y) {
                this.collideCallback();
                // throw new Error("whoops! you eat yourself");
            }
        }
    }
}

class SnakeGame {

    constructor(snakeX, snakeY, snakeInitialLength, initialDirection, fieldSize, speed) {

        this._gameDisplay = document.querySelector(".game__field");
        this._emptyCell = `<div class="game__field-cell"></div>`;
        this._fieldSize = 15;

        this._gameDisplay.innerHTML = _emptyCell.repeat(_fieldSize ** 2);

        this.getDisplayCell = (x, y) => _gameDisplay.children[x % _fieldSize + (y % _fieldSize) * _fieldSize];

        this.clearDisplayCell = (x, y) => { getDisplayCell(x, y).removeAttribute("style"); }

        this.keyDirectionSheet = {
            "w": "up",
            "d": "right",
            "s": "down",
            "a": "left"
        };
    
        this.oppositeDirections = {
            "up": "down",
            "down": "up",
            "left": "right",
            "right": "left"
        };
        
        this.foodSkins = [
            './sources/svg/apple.svg',
            './sources/svg/lemon.svg',
            './sources/svg/orange.svg',
            './sources/svg/pear.svg',
            './sources/svg/pineapple.svg',
            './sources/svg/plum.svg',
            './sources/svg/strawberry.svg'
        ];

        GameObject.renderCallback = (x, y, skin) => {
            getDisplayCell(x, y).style.setProperty('background-image', `url(${skin})`);
        };
        
        this.keyDirection = "right";

        this._scoreSpan = document.querySelector(".game__stat_score");

        this.snake = new SnakeObject(x=snakeX, y=snakeY, startingLength=snakeInitialLength, initialDirection=initialDirection);
        this.snake.render();
        this.foodItem = new GameObject(10, 0, foodSkins[0]);
        this.foodItem.render();
        
        setInterval(() => {
            this.gameCycle();
        }, speed);

        document.addEventListener("keypress", function(event) {
            let pressedDirection = keyDirectionSheet[event.key];
            if (oppositeDirections[pressedDirection] === keyDirection) {
                return;
            }
            keyDirection = pressedDirection;
        });
    }

    gameCycle() {
        if(snake.x % _fieldSize === foodItem.x % _fieldSize && snake.y % _fieldSize === foodItem.y % _fieldSize) {
            snake.elongate();
            
            foodItem.skin = foodSkins[((foodSkins.length - 1) * Math.random()).toPrecision(1)];
            foodItem.x = ((_fieldSize - 1) * Math.random()).toPrecision(1);
            foodItem.y = ((_fieldSize - 1) * Math.random()).toPrecision(1);
            foodItem.render();
    
            _scoreSpan.dataset.value = Number(_scoreSpan.dataset.value) + 10;
        }
        else {
            snake.move(keyDirection);
        }
        snake.render();
        foodItem.render();
    }
}

const _gameDisplay = document.querySelector(".game__field");
const _emptyCell = `<div class="game__field-cell"></div>`;
const _fieldSize = 15;

_gameDisplay.innerHTML = _emptyCell.repeat(_fieldSize ** 2);

const getDisplayCell = (x, y) => _gameDisplay.children[x % _fieldSize + (y % _fieldSize) * _fieldSize];

const clearDisplayCell = (x, y) => { getDisplayCell(x, y).removeAttribute("style"); }

const keyDirectionSheet = {
    "w": "up",
    "d": "right",
    "s": "down",
    "a": "left"
};

const oppositeDirections = {
    "up": "down",
    "down": "up",
    "left": "right",
    "right": "left"
};

const foodSkins = [
    './sources/svg/apple.svg',
    './sources/svg/lemon.svg',
    './sources/svg/orange.svg',
    './sources/svg/pear.svg',
    './sources/svg/pineapple.svg',
    './sources/svg/plum.svg',
    './sources/svg/strawberry.svg'
];

GameObject.renderCallback = (x, y, skin) => {
    getDisplayCell(x, y).style.setProperty('background-image', `url(${skin})`);
};

const _scoreSpan = document.querySelector(".game__stat_score");

let keyDirection = "right";

let foodItem = new GameObject(10, 0, foodSkins[0]);
foodItem.render();
let snake = new SnakeObject();
snake.render();

let gameCycle = setInterval(() => {
    // bro seriously, do sth about your movement system. this is just trash
    if(snake.x % _fieldSize === foodItem.x % _fieldSize && snake.y % _fieldSize === foodItem.y % _fieldSize) {
        snake.elongate();
        
        foodItem.skin = foodSkins[((foodSkins.length - 1) * Math.random()).toPrecision(1)];
        foodItem.x = ((_fieldSize - 1) * Math.random()).toPrecision(1);
        foodItem.y = ((_fieldSize - 1) * Math.random()).toPrecision(1);
        foodItem.render();

        _scoreSpan.dataset.value = Number(_scoreSpan.dataset.value) + 10;
    }
    else {
        snake.move(keyDirection);
    }
    snake.render();
    foodItem.render();
}, 100);

document.addEventListener("keypress", function (event) {
    let pressedDirection = keyDirectionSheet[event.key];
    if (oppositeDirections[pressedDirection] === keyDirection) {
        return;
    }
    keyDirection = pressedDirection;
});
