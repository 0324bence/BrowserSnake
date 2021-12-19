"use strict";
class Settings {
    constructor(canvas) {
        this.canvas = canvas;
        this.PLAYAREA = [this.canvas.width, this.canvas.height];
        this.slots = this.PLAYAREA.map((num, i) => {
            return num / Settings.SIZE[i];
        });
    }
}
Settings.FPS = 60;
Settings.SPEED = 5;
Settings.SIZE = [40, 40];
Settings.MOVESIZE = 40;
Settings.PIXELS_PER_FRAME = Math.floor(Settings.SIZE[0] / Settings.SPEED);
Settings.SNAKE_COLOUR = "black";
Settings.SNAKE_HEAD = "blue";
Settings.FOOD_COLOUR = "red";
class Food extends Settings {
    constructor(canvas, ctx) {
        super(canvas);
        this.ctx = ctx;
        this.pos = [
            Math.floor(Math.random() * (this.slots[0] - 1) + 1) * Settings.SIZE[0] + Settings.SIZE[0] / 2,
            Math.floor(Math.random() * (this.slots[1] - 1) + 1) * Settings.SIZE[1] + Settings.SIZE[1] / 2,
        ];
    }
    New(pos, snake) {
        const a = Math.floor(Math.random() * (this.slots[0] - 1) + 1) * Settings.SIZE[0] + Settings.SIZE[0] / 2;
        const b = Math.floor(Math.random() * (this.slots[1] - 1) + 1) * Settings.SIZE[1] + Settings.SIZE[1] / 2;
        if (pos[0] != a && pos[1] != b) {
            for (let i in snake) {
                if (snake[i][0] == a && snake[i][1] == b) {
                    this.New(pos, snake);
                    return;
                }
            }
        }
        this.pos = [a, b];
    }
    Draw() {
        if (gameOver)
            return;
        this.ctx.beginPath();
        this.ctx.fillStyle = Settings.FOOD_COLOUR;
        this.ctx.lineWidth = 0;
        this.ctx.arc(...this.pos, Settings.SIZE[0] / 2, 0, 2 * Math.PI, false);
        this.ctx.fill();
        this.ctx.closePath();
    }
}
class Snake extends Settings {
    constructor(canvas, ctx, food) {
        super(canvas);
        this.ctx = ctx;
        this.food = food;
        this.Velocity = [0, 0];
        this.pos = [
            Math.floor(Math.random() * (this.slots[0] - 1) + 1) * Settings.SIZE[0] + Settings.SIZE[0] / 2,
            Math.floor(Math.random() * (this.slots[1] - 1) + 1) * Settings.SIZE[1] + Settings.SIZE[1] / 2,
        ];
        this.snake = [];
        this.moves = [];
        this.score = 0;
        this.Input = (event) => {
            if (event.repeat)
                return;
            console.log("move");
            switch (event.key) {
                case "ArrowUp":
                    this.moves.push(event.key);
                    break;
                case "ArrowDown":
                    this.moves.push(event.key);
                    break;
                case "ArrowRight":
                    this.moves.push(event.key);
                    break;
                case "ArrowLeft":
                    this.moves.push(event.key);
                    break;
            }
        };
        this.movement = 0;
    }
    CollisionCheck() {
        if (this.pos[0] <= 0 ||
            this.pos[1] <= 0 ||
            this.pos[0] > this.PLAYAREA[0] - Settings.SIZE[0] / 2 ||
            this.pos[1] > this.PLAYAREA[1] - Settings.SIZE[1] / 2) {
            gameOver = true;
            return;
        }
        if (this.pos[0] == this.food.pos[0] && this.pos[1] == this.food.pos[1]) {
            this.snake.push(this.pos);
            this.food.New(this.pos, this.snake);
            this.score++;
            document.getElementById("score").innerText = `Score ${this.score}`;
            return;
        }
        for (let i in this.snake) {
            if (this.pos[0] == this.snake[i][0] && this.pos[1] == this.snake[i][1]) {
                gameOver = true;
                return;
            }
        }
    }
    Draw() {
        if (gameOver) {
            this.ctx.beginPath();
            this.ctx.font = `60px Arial`;
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillStyle = "black";
            this.ctx.fillText("Game Over", this.PLAYAREA[0] / 2, this.PLAYAREA[1] / 2);
            this.ctx.font = `30px Arial`;
            this.ctx.fillText("Press ENTER to restart", this.PLAYAREA[0] / 2, this.PLAYAREA[1] / 2 + 50);
            this.ctx.closePath();
            return;
        }
        this.ctx.beginPath();
        this.ctx.fillStyle = Settings.SNAKE_HEAD;
        this.ctx.arc(...this.pos, Settings.SIZE[0] / 2, 0, 2 * Math.PI, false);
        this.ctx.fill();
        this.ctx.closePath();
        for (let i in this.snake) {
            this.ctx.beginPath();
            this.ctx.fillStyle = Settings.SNAKE_COLOUR;
            this.ctx.arc(...this.snake[i], Settings.SIZE[0] / 2, 0, 2 * Math.PI, false);
            this.ctx.fill();
            this.ctx.closePath();
        }
        this.snake = this.snake.map((val, idx, arr) => {
            if (idx === 0)
                return this.pos;
            return arr[idx - 1];
        });
        this.pos = this.pos.map((num, i) => {
            return num + this.Velocity[i] * Settings.PIXELS_PER_FRAME;
        });
        this.movement++;
        if (this.movement !== Settings.SPEED)
            return;
        switch (this.moves[0]) {
            case "ArrowUp":
                if (this.Velocity[1] == 0) {
                    this.Velocity[1] = -1;
                    this.Velocity[0] = 0;
                }
                break;
            case "ArrowDown":
                if (this.Velocity[1] == 0) {
                    this.Velocity[1] = 1;
                    this.Velocity[0] = 0;
                }
                break;
            case "ArrowRight":
                if (this.Velocity[0] == 0) {
                    this.Velocity[0] = 1;
                    this.Velocity[1] = 0;
                }
                break;
            case "ArrowLeft":
                if (this.Velocity[0] == 0) {
                    this.Velocity[0] = -1;
                    this.Velocity[1] = 0;
                }
                break;
        }
        this.moves.shift();
        this.CollisionCheck();
        this.movement = 0;
    }
}
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
let food = new Food(canvas, ctx);
let snake = new Snake(canvas, ctx, food);
let lastFrame = 0;
let gameOver = false;
function gameLoop(time) {
    requestAnimationFrame(gameLoop);
    if (!((time - lastFrame) / 1000 > 1 / Settings.FPS))
        return;
    lastFrame = time;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    food.Draw();
    snake.Draw();
}
addEventListener("keydown", snake.Input);
addEventListener("keyup", e => {
    if (!(e.key == "Enter"))
        return;
    if (!gameOver)
        return;
    removeEventListener("keydown", snake.Input);
    food = new Food(canvas, ctx);
    snake = new Snake(canvas, ctx, food);
    gameOver = false;
    addEventListener("keydown", snake.Input);
});
requestAnimationFrame(gameLoop);
//# sourceMappingURL=index.js.map