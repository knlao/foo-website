const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

let canvasX = 0;
let canvasY = 0;
let canvasWidth = 0;
let canvasHeight = 0;

function adjustCanvas() {
  const { x, y, width, height } = canvas.getBoundingClientRect();
  canvasX = x;
  canvasY = y;
  canvasWidth = width;
  canvasHeight = height;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
}

adjustCanvas();
window.addEventListener("resize", adjustCanvas);

function distance([x0, y0], [x1, y1]) {
  return Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2);
}

function radianToDegree(radian) {
  return radian / (Math.PI / 180);
}

function degreeToRadian(degree) {
  return degree * (Math.PI / 180);
}

class Snake {
  constructor(world) {
    this.world = world;

    const x = Math.random() * canvasWidth;
    const y = Math.random() * canvasHeight;

    this.followPointer = false;
    this.speed = 1;

    this.body = [];
    for (let i = 0; i < 3; i++) {
      this.body.push([x, y + this.step * i, 90]); // 90°
    }

    // 順時針轉或者逆時針轉
    this.direction = Math.random() < 0.5 ? 1 : -1;
  }

  get bodyRadius() {
    return 8 + 0.1 * this.body.length;
  }

  get head() {
    return this.body[this.body.length - 1];
  }

  get step() {
    return (this.bodyRadius / 2) * this.speed;
  }

  speedUp() {
    this.speed = 2;
  }

  resetSpeed() {
    this.speed = 1;
  }

  get randomForwardRadian() {
    if (this.followPointer) {
      const { clientX, clientY } = this.world.currentPointer;

      return Math.atan2(
        clientY - (canvasY + canvasHeight / 2),
        clientX - (canvasX + canvasWidth / 2)
      );
    } else {
      let degree = this.head[2]; // [x, y, degree]

      // 1/3 的概率會轉向 0 ~ 10 度
      if (Math.random() < 0.33) {
        degree = (degree + Math.random() * 10 * this.direction) % 360;
      }

      // 1/10 的概率轉向 -45 ~ 45 度
      if (Math.random() < 0.1) {
        degree = (degree + Math.random() * 90 - 45) % 360;
      }

      if (Math.random < 0.05) {
        this.direction = -this.direction;
      }

      return degreeToRadian(degree);
    }
  }

  move() {
    const radian = this.randomForwardRadian;

    const [headX, headY] = this.head;

    const targetX = headX + Math.cos(radian) * this.step;
    const targetY = headY + Math.sin(radian) * this.step;

    const degree = radianToDegree(radian);
    this.body.push([targetX, targetY, degree]);

    const hasFood = this.world.checkFood(this.head, this.bodyRadius);

    if (!hasFood) {
      this.body.shift();
    }
  }

  render() {
    ctx.strokeStyle = "#666";
    ctx.fillStyle = "#222";
    ctx.font = `${this.bodyRadius * 2}px serif`;
    // use these alignment properties for "better" positioning
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    this.body.forEach(([x, y, degree]) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(degreeToRadian(degree - 90));
      ctx.beginPath();
      // ctx.arc(x, y, this.bodyRadius, 0, 2 * Math.PI);
      ctx.fillText("😀", 0, 0);
      // ctx.fill();
      // ctx.stroke();
      ctx.restore();
    });
  }
}

class World {
  constructor() {
    this.maxSnakes = 20;

    this.init();
    this.bindEvents();
  }

  init() {
    this.snakes = [];
    for (let i = 0; i < this.maxSnakes; i++) {
      this.snakes.push(new Snake(this));
    }

    // make the first snake the special one which centered and following the cursor
    this.theOne = this.snakes[0];
    this.theOne.followPointer = true;

    this.foods = [];
    // random spread some foods sround theOne
    const [x, y] = this.theOne.head;
    const minX = x - canvasWidth / 2;
    const minY = y - canvasHeight / 2;
    for (let i = 0; i < 100; i++) {
      const x = minX + Math.random() * canvasWidth;
      const y = minY + Math.random() * canvasHeight;
      this.foods.push([x, y]);
    }
  }

  bindEvents() {
    canvas.addEventListener("pointermove", (e) => {
      this.currentPointer = e;
    });

    document.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        this.stop = !this.stop;
      }
    });

    document.addEventListener("pointerdown", (e) => {
      this.theOne.speedUp();
    });

    document.addEventListener("pointerup", (e) => {
      this.theOne.resetSpeed();
    });
  }

  /**
   * 檢查頭部是否觸碰到食物
   * @param {[x, y]} point - 坐標點，一般是 snake 的頭部
   * @param {number} radius - 以坐標點為中心的圓的半徑，一般是 snake 的 bodyRadius
   * @returns {boolean} 坐標點觸碰到食物時為 true
   */
  checkFood(point, radius) {
    let hasFood = false;
    this.foods.forEach((food, idx) => {
      const dist = distance(point, food);
      if (dist < radius) {
        this.foods.splice(idx, 1);
        hasFood = true;
        return;
      }
    });
    return hasFood;
  }

  /**
   * 檢查 snake 是否撞到其他的 snakes
   * @param {Snake} snake - 被檢查的 snake
   * @returns {boolean} 被檢查的 snake 有撞到其他 snakes 時為 true
   */
  checkCollision(snake) {
    const head = snake.head;
    let touched = false;
    this.snakes
      .filter((s) => s !== snake)
      .forEach((s) => {
        const minDist = s.bodyRadius + snake.bodyRadius;
        s.body.forEach((point) => {
          const dist = distance(point, head);
          if (dist < minDist) {
            touched = true;
            return;
          }
        });

        if (touched) {
          return;
        }
      });
    return touched;
  }

  /**
   * 檢查 snake，如果撞到則移除並轉為食物
   * @param {Snake} snake - 被檢查的 snake
   */
  adjudge(snake) {
    const touched = this.checkCollision(snake);
    if (touched) {
      const idx = this.snakes.indexOf(snake);
      this.snakes.splice(idx, 1); // remove from list

      this.foods.push(...snake.body); // turn to food

      const newSnake = new Snake(this); // drop a new one
      this.snakes.push(newSnake);

      if (snake === this.theOne) {
        this.theOne = newSnake;
        this.theOne.followPointer = true;
      }
    }
  }

  renderFood() {
    ctx.fillStyle = "tomato";
    this.foods.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });
  }

  render() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const [headX, headY] = this.theOne.head;

    ctx.save();
    ctx.translate(canvasWidth / 2 - headX, canvasHeight / 2 - headY);

    this.renderFood();
    this.snakes.forEach((s) => s.render());

    ctx.restore();
  }

  run() {
    if (!this.stop) {
      if (this.currentPointer) {
        this.snakes.forEach((snake) => {
          snake.move();
          this.adjudge(snake);
        });
      }

      this.render();
    }
    window.requestAnimationFrame(this.run.bind(this));
  }

  restart() {
    this.init();
  }

  pause() {
    this.stop = true;
  }

  resume() {
    this.stop = false;
  }
}

const world = new World();
world.run();

document.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", (e) => {
    world[button.id]();
  });
});