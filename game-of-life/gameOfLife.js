const width = 30;
const height = 30;

// const gameField = document.getElementById('game-field');

const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

class Matrix {
  constructor(nrows, ncols, element = (x, y) => undefined) {
    this.nrows = nrows;
    this.ncols = ncols;
    this.content = [];

    for (let row = 0; row < this.nrows; row++) {
      for (let col = 0; col < this.ncols; col++) {
        this.content[row * this.ncols + col] = element(row, col);
      }
    }
  }
  get(row, col) {
    if (row < 0 || row >= this.nrows || col < 0 || col >= this.ncols) return undefined;
    else return this.content[row * this.ncols + col];
  }
  set(row, col, value) {
    if (row < 0 || row >= this.nrows || col < 0 || col >= this.ncols) return;
    this.content[row * this.ncols + col] = value;
  }
}


class Field {
  constructor(nrows, ncols, cells, tableRows = undefined) {
    this.nrows = nrows;
    this.ncols = ncols;
    this.cells = cells;
    this.tableRows = tableRows || this.generateTableRows(this.cells);
  }

  static random(nrows, ncols, aliveProbability = 0.5) {
    return new Field(
      nrows,
      ncols,
      new Matrix(nrows, ncols, (x, y) => Math.random() < aliveProbability)
    );
  }

  generateTableRows(cells) {
    let tableRows = [];
    for (let row = 0; row < this.nrows; row++) {
      let tr = document.createElement('tr');
      // Add table data to each table row
      for (let col = 0; col < this.ncols; col++) {
        let td = document.createElement('td');
        td.dataset.row = row;
        td.dataset.col = col;
        td.addEventListener('click', (event) => {
          let row = Number(event.target.dataset.row);
          let col = Number(event.target.dataset.col);
          if (this.cells.get(row, col)) {
            this.cells.set(row, col, false);
            // event.target.style.backgroundColor = 'red';
            td.className = 'dead';
          } else {
            this.cells.set(row, col, true);
            // event.target.style.backgroundColor = 'green';
            td.className = 'alive';
          }
        });
        tr.appendChild(td);
      }
      tableRows.push(tr);
    }
    return tableRows;
  }

  draw(domTable) {
    for (let tr of this.tableRows) {
      for (let td of [...tr.children].filter((el) => el.tagName === 'TD')) {
        if (this.cells.get(Number(td.dataset.row), Number(td.dataset.col))) {
          td.className = 'alive';
        } else {
          td.className = 'dead';
        }
      }
    }
    this.tableRows.forEach((tr) => domTable.appendChild(tr));
  }

  neighbours(row, col) {
    return [
      this.cells.get(row - 1, col - 1),
      this.cells.get(row - 1, col),
      this.cells.get(row - 1, col + 1),

      this.cells.get(row, col - 1),
      this.cells.get(row, col + 1),

      this.cells.get(row + 1, col - 1),
      this.cells.get(row + 1, col),
      this.cells.get(row + 1, col + 1)
    ];
  }

  numberOfNeighbours(row, col) {
    return this.neighbours(row, col).reduce((acc, x) => x ? acc + 1 : acc, 0);
  }
}

const nextGeneration = (field) => {
  let newCells = new Matrix(field.nrows, field.ncols);
  for (let row = 0; row < field.nrows; row++) {
    for (let col = 0; col < field.ncols; col++) {
      let numberOfNeighbours = field.numberOfNeighbours(row, col);
      if (numberOfNeighbours < 2 || numberOfNeighbours > 3) {
        newCells.set(row, col, false);
      } else if (numberOfNeighbours === 2) {
        newCells.set(row, col, field.cells.get(row, col));
      } else {
        newCells.set(row, col, true);
      }
    }
  }
  field.tableRows.forEach((el) => el.remove());
  return new Field(field.nrows, field.ncols, newCells);
};

const nextBtn = document.getElementById('next');
const autoRunBtn = document.getElementById('auto-run');
const table = document.getElementById('game-field');

let field = Field.random(30, 30, 0);
field.draw(table);

nextBtn.addEventListener('click', (event) => {
  field = nextGeneration(field);
  field.draw(table);
});

let running = null;
autoRunBtn.addEventListener('click', (event) => {
  if (running) {
    clearInterval(running);
    running = null;
    // Styling
    event.target.style.backgroundColor = 'ghostwhite';
    event.target.style.color = 'black';
    event.target.textContent = 'Run';
  } else {
    running = setInterval(() => {
      field = nextGeneration(field);
      field.draw(table);
      // Styling
      event.target.style.backgroundColor = '#247D00';
      event.target.style.color = 'white';
      event.target.textContent = 'Pause';
    }, 200);
  }
});



// // This hold the checkboxes that display the grid in the document
// let cells = [];
// for (let row = 0; row < height; row++) {
//   let row = document.createElement('tr');
//   gameField.appendChild(row);
//   for (let col = 0; col < width; col++) {
//     let cell = document.createElement('td');
//     cell.classList += "cell";
//     cell.dataset.alive = false;
//     cell.addEventListener('click', (event) => {
//       if (event.target.style.backgroundColor === 'green') {
//         event.target.style.backgroundColor = `rgba(${randomInt(0, 255)}, ${randomInt(0, 255)}, ${randomInt(0, 255)}, 0.2)`;
//         event.target.dataset.alive = false;
//       } else {
//         event.target.style.backgroundColor = 'green';
//         event.target.dataset.alive = true;
//       }
//     });
//     // Just for fun
//     cell.style.backgroundColor = `rgba(${randomInt(0, 255)}, ${randomInt(0, 255)}, ${randomInt(0, 255)}, 0.2)`;
//     row.appendChild(cell);
//     cells.push(cell);
//   }
// }

//
// function gridFromCheckboxes() {
//   return checkboxes.map(box => box.checked);
// }
//
// function checkboxesFromGrid(grid) {
//   grid.forEach((value, i) => checkboxes[i].checked = value);
// }
//
// function randomGrid() {
//   let result = [];
//   for (let i = 0; i <width * height; i++) {
//     result.push(Math.random() < 0.3);
//   }
//   return result;
// }
//
// checkboxesFromGrid(randomGrid());
//
// function countNeighbors(grid, x, y) {
//   let count = 0;
//   for (let y1 = Math.max(0, y - 1); y1 <= Math.min(height - 1, y + 1); y1++) {
//     for (let x1 = Math.max(0, x - 1); x1 <= Math.min(width - 1, x + 1); x1++) {
//       if ((x1 !== x || y1 !== y) && grid[x1 + y1 * width]) {
//         count++;
//       }
//     }
//   }
//   return count;
// }
//
// function nextGeneration(grid) {
//   let newGrid = new Array(width * height);
//   for (let y = 0; y < height; y++) {
//     for (let x = 0; x < width; x++) {
//       let neighbors = countNeighbors(grid, x, y);
//       let offset = x + y * width;
//       if (neighbors < 2 || neighbors > 3) {
//         newGrid[offset] = false;
//       } else if (neighbors === 2) {
//         newGrid[offset] = grid[offset];
//       } else {
//         newGrid[offset] = true;
//       }
//     }
//   }
//   return newGrid;
// }
//
// function turn() {
//   checkboxesFromGrid(nextGeneration(gridFromCheckboxes()));
// }
//
// document.querySelector("#next").addEventListener("click", turn);
//
// let running = null;
// document.querySelector("#run").addEventListener("click", () => {
//   if (running) {
//     clearInterval(running);
//     running = null;
//   } else {
//     running = setInterval(turn, 400);
//   }
// });