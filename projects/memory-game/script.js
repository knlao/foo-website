function setup(selector, columns, rows, match = 2) {
  function random(array) {
    const idx = Math.random() * array.length;
    return array.splice(idx, 1)[0];
  }

  function show(elem) {
    elem.classList.remove("hide");
    elem.classList.add("show");
  }

  function hide(elem) {
    elem.classList.remove("show");
    elem.classList.add("hide");
  }

  function clear(elem) {
    elem.classList.remove("show");
    elem.classList.add("clear");
    elem.enable = false;
  }

  if ((columns * rows) % match !== 0) {
    alert("row and columns can not match required");
    return false;
  }

  const container = document.querySelector(selector);
  const width = container.offsetWidth;
  const height = container.offsetHeight;
  const cellWidth = width / columns;
  const cellHeight = height / rows;

  const cells = [];
  const cellLen = rows * columns;

  let marked = [];
  let enable = true;

  for (let i = 0; i < cellLen; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.style.width = cellWidth + "px";
    cell.style.height = cellHeight + "px";

    cell.addEventListener("click", () => {
      if (!enable) {
        return;
      }

      if (cell.classList.contains("clear")) {
        return;
      }

      if (marked.includes(cell)) {
        return;
      }

      show(cell);

      if (marked.length === 0) {
        marked.push(cell);
      } else if (cell.innerHTML === marked[0].innerHTML) {
        marked.push(cell);
        if (marked.length === match) {
          marked.forEach(clear);
          marked = [];
        }
      } else {
        enable = false;
        setTimeout(() => {
          marked.forEach(hide);
          hide(cell);
          marked = [];
          enable = true;
        }, 500);
      }
    });

    container.appendChild(cell);
    cells.push(cell);
  }

  const _cells = [...cells];
  for (let i = 0; i < cellLen / match; i++) {
    for (let j = 0; j < match; j++) {
      random(_cells).innerHTML = i;
    }
  }

  setTimeout(() => {
    cells.forEach((cell) => {
      cell.classList.add("hide");
    });
  }, 3000);
}

setup("#app", 6, 6, 4);