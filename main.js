class GameObject {
    
    constructor(x, y, skin) {
        this.x = x;
        this.y = y;
        this.position = {
            x: this.x,
            y: this.y
        }
        this.skin = skin;

        this.renderCallback = f => f;
    }

    render(x=this.x, y=this.y, graphics=this.skin) {
        GameObject.renderCallback(x, y, graphics);
    }

    move(x, y) {
        this.x = x;
        this.y = y;
    }
}

class SnakeObject extends GameObject {
    
    static defaultCollisionCallback() {};
    
    constructor(x=2, y=0, startingLength=3, initialDirection="right") {
        super(x, y, "./sources/svg/snake_head.svg");
        this.currentDirection = initialDirection;
        this.segments = [];
        for (let i = startingLength - 2; i >= 0; i--) {
            this.segments.push({ x: i, y: y });
        }
        this.collisionCallback = SnakeObject.defaultCollisionCallback;
    }

    get lastSegment() {
        return this.segments[this.segments.length - 1];
    }

    render() {
        for (let s of this.segments) {
            super.render(s.x, s.y, "./sources/svg/snake_segment.svg");
        }
        super.render();
    }

    move(direction) {
        this.currentDirection = direction;

        this.lastSegment.x = this.x;
        this.lastSegment.y = this.y;
        
        this.segments.unshift(this.segments.pop());
        
        switch (this.currentDirection) {
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

    growTail() {
        this.segments.unshift({ x: this.x, y: this.y });
    }

    checkSelfCollision() {
        for (let s of this.segments) {
            if (this.x === s.x && this.y === s.y) {
                this.collisionCallback();
            }
        }
    }
}

class SnakeGame {

    constructor(fieldWidth=10, fieldHeight=6, cellSize=40, snakeX=2, snakeY=0, snakeInitialLength=3, speed=400) {
        this._gameDisplay = document.querySelector(".game__field");
        
        this.fieldWidth = fieldWidth;
        this.fieldHeight = fieldHeight;
        this.speed = speed;
        
        this.cellSize = cellSize;
        this._scoreSpan = document.querySelector(".game__stat_score");
        this._recordSpan = document.querySelector(".game__stat_record");
        this._emptyCell = `<div class="game__field-cell"></div>`;

        this.snakeInitialX = snakeX;
        this.snakeInitialY = snakeY;
        this.snakeInitialLength = snakeInitialLength;
        this._initialDirection = "right";

        this._keyDirectionSheet = {
            "w": "up",
            "d": "right",
            "s": "down",
            "a": "left"
        };
    
        this._oppositeDirections = {
            "up": "down",
            "down": "up",
            "left": "right",
            "right": "left"
        };
        
        this._foodSkins = [
            './sources/svg/apple.svg',
            './sources/svg/lemon.svg',
            './sources/svg/orange.svg',
            './sources/svg/pear.svg',
            './sources/svg/pineapple.svg',
            './sources/svg/plum.svg',
            './sources/svg/strawberry.svg'
        ];

        this._preferences = [ "fieldWidth", "fieldHeight", "cellSize", "snakeInitialX", "snakeInitialY", "snakeInitialLength", "speed"];

        GameObject.renderCallback = (x, y, skin) => { this.getDisplayCell(x, y).style.setProperty('background-image', `url(${skin})`) };
        SnakeObject.defaultCollisionCallback = () => {
            clearInterval(this.gameCycleInterval);
            alert(`GAME OVER! you eat yourself\n\nscore: ${this._scoreSpan.dataset.value}`);
            if(+(this._scoreSpan.dataset.value) > +(this._recordSpan.dataset.value)) {
                alert(`NEW HIGHSCORE!\ncongratulations on getting this far!`);
                this._recordSpan.dataset.value = this._scoreSpan.dataset.value;
            }
            this._scoreSpan.dataset.value = 0;
            this.setupGameSession();
            this.start();
        };

        document.addEventListener("keypress", (event) => {
            if(this.directionChanged) {
                return;
            }
            let pressedDirection = this._keyDirectionSheet[event.key];
            if (this._oppositeDirections[pressedDirection] === this.keyDirection) {
                return;
            }
            this.keyDirection = pressedDirection;
            this.directionChanged = true;
        });
        
        this.setupGameSession();
        this.start();
    }

    // maybe possible to generalize..

    set fieldWidth(value) {
        if (+value > 0) {
            this._fieldWidth = +value;
            this._gameDisplay.style.setProperty("--col-count", +value);
        }
    }

    set fieldHeight(value) {
        if (+value > 0) {
            this._fieldHeight = +value;
            this._gameDisplay.style.setProperty("--row-count", +value);
        }
    }

    set cellSize(value) { 
        if(+value > 0) {
            this._cellSize = +value;
            this._gameDisplay.style.setProperty("--cell-size", +value + "px");
        }
    }
    
    set snakeInitialX(value) { +value >= 0 && +value < this._fieldWidth ? this._snakeInitialX = +value : 0; }

    set snakeInitialY(value) { +value >= 0 && +value < this._fieldHeight ? this._snakeInitialY = +value : 0; }

    set snakeInitialLength(value) { +value > 0 ? this._snakeInitialLength = +value : 0; }

    set speed(value) { +value > 10 ? this._speed = +value : 0; }


    setupGameSession() {
        this._gameDisplay.innerHTML = this._emptyCell.repeat(this._fieldWidth * this._fieldHeight);

        this.keyDirection = this._initialDirection;
        this.directionChanged = false;

        this.snake = new SnakeObject(this._snakeInitialX, this._snakeInitialY, this._snakeInitialLength, this._initialDirection);
        this.foodItem = new GameObject(0, 0, this._foodSkins[0]);
        this.updateFoodItem();
    }

    setupGamePreferences(newPrefs) {
        for(let p of this._preferences) {
            newPrefs[p] ? this[p] = newPrefs[p] : 0;
        }
    }

    pause() {
        clearInterval(this.gameCycleInterval);
    }

    start() {
        this.normalizeSnakePosition();
        this.snake.render();
        this.foodItem.render();
        clearInterval(this.gameCycleInterval);
        this.gameCycleInterval = setInterval(() => {
            this.gameCycle();
        }, this._speed);
    }

    getDisplayCell(x, y) {
        return this._gameDisplay.children[x + y * this._fieldWidth];
    }

    clearDisplayCell(x, y) {
        this.getDisplayCell(x, y).removeAttribute("style");
    }

    normalizeSnakePosition() {
        this.snake.x %= this._fieldWidth;
        this.snake.y %= this._fieldHeight;
        this.snake.x < 0 ? this.snake.x += this._fieldWidth : 0;
        this.snake.y < 0 ? this.snake.y += this._fieldHeight : 0; 
    }

    updateFoodItem() {
        this.foodItem.skin = this._foodSkins[Math.floor(this._foodSkins.length * Math.random())];
        this.foodItem.x = Math.floor(this._fieldWidth * Math.random());
        this.foodItem.y = Math.floor(this._fieldHeight * Math.random());
    }

    gameCycle() {
        if(this.snake.x === this.foodItem.x && this.snake.y === this.foodItem.y) {
            this.snake.growTail();
            this.updateFoodItem();
            this.foodItem.render();
    
            this._scoreSpan.dataset.value = Number(this._scoreSpan.dataset.value) + 10;
        }
        let tailToClear = this.snake.lastSegment;
        this.clearDisplayCell(tailToClear.x, tailToClear.y);

        this.snake.move(this.keyDirection);
        this.directionChanged = false;
        this.normalizeSnakePosition();

        this.foodItem.render();
        this.snake.render();

        this.snake.checkSelfCollision();
    }
}