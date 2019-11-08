const NROWS = 25;
const NCOLS = 50;
const ALIVEPROP = 0;

/*
 * Implementation of the matrix using simple array.
 */
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

/*
 * Field representing the game field.
 */
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
    const rowIndex = (index) => {
      return (this.nrows + (index % this.nrows)) % this.nrows;
    };

    const colIndex = (index) => {
      return (this.ncols + (index % this.ncols)) % this.ncols;
    };

    return [
      this.cells.get(rowIndex(row - 1), colIndex(col - 1)),
      this.cells.get(rowIndex(row - 1), colIndex(col)),
      this.cells.get(rowIndex(row - 1), colIndex(col + 1)),

      this.cells.get(rowIndex(row), colIndex(col - 1)),
      this.cells.get(rowIndex(row), colIndex(col + 1)),

      this.cells.get(rowIndex(row + 1), colIndex(col - 1)),
      this.cells.get(rowIndex(row + 1), colIndex(col)),
      this.cells.get(rowIndex(row + 1), colIndex(col + 1)),
    ];
    // return [
    //   this.cells.get(row - 1, col - 1),
    //   this.cells.get(row - 1, col),
    //   this.cells.get(row - 1, col + 1),
    //
    //   this.cells.get(row, col - 1),
    //   this.cells.get(row, col + 1),
    //
    //   this.cells.get(row + 1, col - 1),
    //   this.cells.get(row + 1, col),
    //   this.cells.get(row + 1, col + 1)
    // ];
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

let field = Field.random(NROWS, NCOLS, ALIVEPROP);
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