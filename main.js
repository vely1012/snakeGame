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
    constructor(x=2, y=0, startingLength=3, initialDirection="right") {
        super(x, y, "./sources/svg/snake_head.svg");
        this.currentDirection = initialDirection;
        this.segments = [];
        for (let i = startingLength - 2; i >= 0; i--) {
            this.segments.push({ x: i, y: y });
        }
        this.eatFoodCallback = f => f;
        this.collideCallback = f => f;
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

        let lastSegment = this.segments[this.segments.length - 1];
        lastSegment.x = this.x;
        lastSegment.y = this.y;
        
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
                this.collideCallback();
            }
        }
    }
}

class SnakeGame {

    constructor(snakeX=2, snakeY=0, snakeInitialLength=3, initialDirection="right", fieldSize=15, speed=150) {

        this._gameDisplay = document.querySelector(".game__field");
        this._emptyCell = `<div class="game__field-cell"></div>`;
        this._fieldSize = fieldSize;

        this._gameDisplay.innerHTML = this._emptyCell.repeat(this._fieldSize ** 2);

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
            try {
                this.getDisplayCell(x, y).style.setProperty('background-image', `url(${skin})`);
            }
            catch {
                debugger;
            }
        };
        
        this.keyDirection = "right";

        this._scoreSpan = document.querySelector(".game__stat_score");

        this.snake = new SnakeObject(snakeX, snakeY, snakeInitialLength, initialDirection);
        this.snake.collideCallback = () => {
            clearInterval(this.gameCycleInterval);
            confirm(`!GAME OVER!\nyou eat yourself\n\nscore: ${this._scoreSpan.dataset.value}`);
            location.reload();
        }
        this.snake.render();
        this.foodItem = new GameObject(10, 0, this.foodSkins[0]);
        this.foodItem.render();
        
        this.gameCycleInterval = setInterval(() => {
            this.gameCycle();
        }, speed);

        document.addEventListener("keypress", (event) => {
            let pressedDirection = this.keyDirectionSheet[event.key];
            if (this.oppositeDirections[pressedDirection] === this.keyDirection) {
                return;
            }
            this.keyDirection = pressedDirection;
        });
    }

    getDisplayCell(x, y) {
        return this._gameDisplay.children[x + y * this._fieldSize];
    }

    clearDisplayCell(x, y) {
        try {
            this.getDisplayCell(x, y).removeAttribute("style");
        }
        catch {
            debugger;
        }
    }

    normolizeSnakePosition() {
        this.snake.x %= this._fieldSize;
        this.snake.y %= this._fieldSize;
        this.snake.x < 0 ? this.snake.x += this._fieldSize : 0;
        this.snake.y < 0 ? this.snake.y += this._fieldSize : 0; 
    }

    gameCycle() {
        if(this.snake.x === this.foodItem.x && this.snake.y === this.foodItem.y) {
            this.snake.growTail();
            
            this.foodItem.skin = this.foodSkins[Math.floor(this.foodSkins.length * Math.random())];
            this.foodItem.x = Math.floor(this._fieldSize * Math.random());
            this.foodItem.y = Math.floor(this._fieldSize * Math.random());
            this.foodItem.render();
    
            this._scoreSpan.dataset.value = Number(this._scoreSpan.dataset.value) + 10;
        }
        let tailToClear = this.snake.lastSegment;
        this.clearDisplayCell(tailToClear.x, tailToClear.y);
        this.snake.move(this.keyDirection);
        this.normolizeSnakePosition();
        this.foodItem.render();
        this.snake.render();
        this.snake.checkSelfCollision()
    }
}

new SnakeGame();