type numTuple = [number, number];

class Settings {
    public static FPS = 60;
    public static SPEED = 5;
    public static SIZE: numTuple = [40, 40];
    public static MOVESIZE = 40;
    public static SNAKE_COLOUR = "black";
    public static SNAKE_HEAD = "blue";
    public static FOOD_COLOUR = "red";

    constructor(protected canvas: HTMLCanvasElement) {}

    PLAYAREA: numTuple = [this.canvas.width, this.canvas.height];
    slots: numTuple = this.PLAYAREA.map((num, i) => {
        return num / Settings.SIZE[i];
    }) as numTuple;
}

class Food extends Settings {
    constructor(canvas: HTMLCanvasElement, private ctx: CanvasRenderingContext2D) {
        super(canvas);
    }

    public pos: numTuple = [
        Math.floor(Math.random() * (this.slots[0] - 1) + 1) * Settings.SIZE[0],
        Math.floor(Math.random() * (this.slots[1] - 1) + 1) * Settings.SIZE[1],
    ];

    New(pos: numTuple, snake: numTuple[]) {
        const a = Math.floor(Math.random() * (this.slots[0] - 1) + 1) * Settings.SIZE[0];
        const b = Math.floor(Math.random() * (this.slots[1] - 1) + 1) * Settings.SIZE[1];
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
        if (gameOver) return;

        this.ctx.beginPath();
        this.ctx.fillStyle = Settings.FOOD_COLOUR;
        this.ctx.fillRect(...this.pos, ...Settings.SIZE);
        this.ctx.closePath();
    }
}

class Snake extends Settings {
    constructor(canvas: HTMLCanvasElement, private ctx: CanvasRenderingContext2D, private food: Food) {
        super(canvas);
    }

    private Velocity: [-1 | 0 | 1, -1 | 0 | 1] = [0, 0];
    private pos: numTuple = [
        Math.floor(Math.random() * (this.slots[0] - 1) + 1) * Settings.SIZE[0],
        Math.floor(Math.random() * (this.slots[1] - 1) + 1) * Settings.SIZE[1],
    ];
    private snake: numTuple[] = [];

    Input = (event: KeyboardEvent) => {
        switch (event.key) {
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
    };

    CollisionCheck() {
        if (this.pos[0] == this.food.pos[0] && this.pos[1] == this.food.pos[1]) {
            this.snake.push(this.pos);
            this.food.New(this.pos, this.snake);
            return;
        }

        for (let i in this.snake) {
            if (this.pos[0] == this.snake[i][0] && this.pos[1] == this.snake[i][1]) {
                gameOver = true;
                return;
            }
        }

        console.log("collision");
    }

    private movement = 0;

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
        this.ctx.fillRect(...this.pos, ...Settings.SIZE);
        this.ctx.closePath();

        for (let i in this.snake) {
            this.ctx.beginPath();
            this.ctx.fillStyle = Settings.SNAKE_COLOUR;
            this.ctx.fillRect(...this.snake[i], ...Settings.SIZE);
            this.ctx.closePath();
        }

        if (
            this.pos[0] <= 0 ||
            this.pos[1] <= 0 ||
            this.pos[0] >= this.PLAYAREA[0] ||
            this.pos[1] >= this.PLAYAREA[1]
        ) {
            gameOver = true;
            return;
        }

        this.CollisionCheck();

        this.snake = this.snake.map((val, idx, arr) => {
            if (idx === 0) return this.pos;
            return arr[idx - 1];
        });

        this.pos = this.pos.map((num, i) => {
            return num + this.Velocity[i] * Settings.SIZE[i];
        }) as numTuple;
    }
}

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
let food = new Food(canvas, ctx);
let snake = new Snake(canvas, ctx, food);

let lastFrame = 0;

let gameOver = false;

function gameLoop(time: number) {
    requestAnimationFrame(gameLoop);
    if (!((time - lastFrame) / 1000 > 1 / Settings.FPS)) return;
    lastFrame = time;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    food.Draw();
    snake.Draw();
}

addEventListener("keydown", snake.Input);

addEventListener("keyup", e => {
    if (!(e.key == "Enter")) return;
    if (!gameOver) return;

    removeEventListener("keydown", snake.Input);

    food = new Food(canvas, ctx);
    snake = new Snake(canvas, ctx, food);
    gameOver = false;

    addEventListener("keydown", snake.Input);
});

requestAnimationFrame(gameLoop);
