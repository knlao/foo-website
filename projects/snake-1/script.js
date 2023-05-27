(() => {
  const columns = 15;
  const rows = 15;

  const cellCount = columns * rows;

  const game = document.querySelector("#game");

  const width = game.clientWidth;
  const height = game.clientHeight;

  const colUnit = width / columns;
  const rowUnit = height / rows;

  let snake, foodIdx;

  // utils
  const rand = () => Math.floor(Math.random() * cellCount);

  const idxToPos = (idx) => {
    return {
      x: idx % columns,
      y: Math.floor(idx / columns)
    };
  };

  // setup playground
  [...Array(cellCount)].forEach(() => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.style.width = colUnit + "px";
    cell.style.height = rowUnit + "px";
    game.appendChild(cell);
  });

  const cells = [...game.children];

  const dropFood = () => {
    let idx = rand();
    let count = 0;
    while (snake.includes(idx)) {
      idx = rand();
      count += 1;
      if (count > cellCount) {
        break;
      }
    }
    foodIdx = idx;
  };

  const init = () => {
    snake = [rand()];
    dropFood();
    render();
  };

  const move = (offset) => {
    let target = snake[0] + offset;

    let c1 = target < 0; // up
    let c2 = offset === 1 && (snake[0] + 1) % columns === 0; // right
    let c3 = target >= cellCount; // down
    let c4 = offset === -1 && snake[0] % columns === 0; // left
    let c5 = false; // snake.slice(1).includes(target); // self
    if (c1 || c2 || c3 || c4 || c5) {
      alert("Game Over!");
      init();
      return;
    }

    snake.unshift(target);
    if (snake.includes(foodIdx)) {
      dropFood();
    } else {
      snake.pop();
    }
    render();
  };

  // render the game
  const render = () => {
    // reset canvas
    cells.forEach((el) => {
      el.classList.remove("has-snake");
      el.classList.remove("has-food");
    });

    // render food
    cells[foodIdx].classList.add("has-food");

    // render snake
    snake.forEach((idx) => {
      cells[idx].classList.add("has-snake");
    });
  };

  // bind events
  const eventHandler = {
    ArrowUp: () => move(-rows),
    ArrowDown: () => move(rows),
    ArrowLeft: () => move(-1),
    ArrowRight: () => move(+1)
  };

  document.addEventListener("keydown", (e) => {
    const f = eventHandler[e.key];
    if (typeof f === "function") {
      f();
    }
  });

  init();
})();