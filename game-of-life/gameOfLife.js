const width = 30;
const height = 30;

// let gridNode = document.querySelector("#grid");
const gridNode = document.getElementById('grid');

// This hold the checkboxes that display the grid in the document
let checkboxes = [];
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    let box = document.createElement("input");
    box.type = "checkbox";
    box.classList += "cell";
    gridNode.appendChild(box);
    checkboxes.push(box);
  }
  gridNode.appendChild(document.createElement("br"));
}

function gridFromCheckboxes() {
  return checkboxes.map(box => box.checked);
}

function checkboxesFromGrid(grid) {
  grid.forEach((value, i) => checkboxes[i].checked = value);
}

function randomGrid() {
  let result = [];
  for (let i = 0; i <width * height; i++) {
    result.push(Math.random() < 0.3);
  }
  return result;
}

checkboxesFromGrid(randomGrid());

function countNeighbors(grid, x, y) {
  let count = 0;
  for (let y1 = Math.max(0, y - 1); y1 <= Math.min(height - 1, y + 1); y1++) {
    for (let x1 = Math.max(0, x - 1); x1 <= Math.min(width - 1, x + 1); x1++) {
      if ((x1 !== x || y1 !== y) && grid[x1 + y1 * width]) {
        count++;
      }
    }
  }
  return count;
}

function nextGeneration(grid) {
  let newGrid = new Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let neighbors = countNeighbors(grid, x, y);
      let offset = x + y * width;
      if (neighbors < 2 || neighbors > 3) {
        newGrid[offset] = false;
      } else if (neighbors === 2) {
        newGrid[offset] = grid[offset];
      } else {
        newGrid[offset] = true;
      }
    }
  }
  return newGrid;
}

function turn() {
  checkboxesFromGrid(nextGeneration(gridFromCheckboxes()));
}

document.querySelector("#next").addEventListener("click", turn);

let running = null;
document.querySelector("#run").addEventListener("click", () => {
  if (running) {
    clearInterval(running);
    running = null;
  } else {
    running = setInterval(turn, 400);
  }
});