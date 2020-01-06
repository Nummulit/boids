class Vec2D {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  copy() {
    return new Vec2D(this.x, this.y);
  }

  add(vec) {
    return new Vec2D(this.x + vec.x, this.y + vec.y);
  }

  subtract(vec) {
    return new Vec2D(this.x - vec.x, this.y - vec.y);
  }

  multiply(scalar) {
    return new Vec2D(this.x * scalar, this.y * scalar);
  }

  divide(scalar) {
    return new Vec2D(this.x / scalar, this.y / scalar);
  }

  dot(vec) {
    return this.x * vec.x + this.y * vec.y;
  }

  norm() {
    return Math.sqrt(this.dot(this));
  }
}

class RectangularObstacle {
  constructor(pos, dim) {
    this.pos = pos;
    this.dim = dim;
  }

  hasInside(vec) {
    return (
      this.pos.x <= vec.x && vec.x <= this.pos.x + this.dim.x && 
      this.pos.y <= vec.y && vec.y <= this.pos.y + this.dim.y
    );
  }
}

class Boid {
  constructor(
    pos,
    vel,
    radius,
    radii = { cohesion: 80, separation: 20, alignment: 100 },
    coefficients = { cohesion: 0.001, separation: 0.1, alignment: 0.01 },
    maxSpeed = 3,
    color = 'lime'
  ) {
    this.pos = pos;
    this.vel = vel;
    this.radius = radius;
    this.radii = radii;
    this.coefficients = coefficients;
    this.maxSpeed = maxSpeed;
    this.color = color;
  }

  // Return all boids from `boids` in given `radius` (except itself).
  neighbours(boids, radius) {
    return boids.filter(
      boid => this !== boid && this.pos.subtract(boid.pos).norm() < radius
    );
  }

  // Calculate position after collision with every obstacle from `obstacles`.
  collide(obstacles) {
    for (let obstacle of obstacles) {
      // Rectangle enlarged by this.radius for easier calculation of collision.
      const boundingBox = new RectangularObstacle(
        new Vec2D(obstacle.pos.x - this.radius, obstacle.pos.y - this.radius),
        new Vec2D(obstacle.dim.x + 2 * this.radius, obstacle.dim.y + 2 * this.radius)
      );

      // Needed for deciding in which direction to reflect.
      const boundingBoxCenter = boundingBox.pos.add(boundingBox.dim.divide(2));
      const ratio = boundingBox.dim.x / boundingBox.dim.y;
      const vecToCenter = this.pos.subtract(boundingBoxCenter);

        if (boundingBox.hasInside(this.pos)) {
          if (Math.abs(vecToCenter.x) > ratio * Math.abs(vecToCenter.y)) {
            this.vel.x *= -1;
          } else {
            this.vel.y *= -1;
          }
          while (boundingBox.hasInside(this.pos)) {
            this.pos = this.pos.add(this.vel);
          }
        }
    }
  }

  update(boids) {
    /**
     * For optimization we will sort the radii in descending order so the smaller ones will search only through 
     * previously filtered boids.
     */
    const sortedRadii = Object.entries(this.radii).sort((prev, next) => prev[1] < next[1]);
    let neighbours = boids;
    for (let [ruleName, radius] of sortedRadii) {
      neighbours = this.neighbours(neighbours, radius);
      this.vel = this.vel.add(this[ruleName](neighbours))
    }

    if (this.vel.norm() > this.maxSpeed) {
      this.vel = this.vel.divide(this.vel.norm()).multiply(this.maxSpeed);
    }

    this.pos = this.pos.add(this.vel);
  }

  cohesion(neighbours) {
    if (neighbours.length === 0) return new Vec2D(0, 0);

    let centerPos = new Vec2D(0, 0);
    for (let boid of neighbours) {
      centerPos = centerPos.add(boid.pos);
    }
    centerPos = centerPos.divide(neighbours.length);
    return centerPos
      .subtract(this.pos)
      .multiply(this.coefficients.cohesion);
  }

  separation(neighbours) {
    if (neighbours.length === 0) return new Vec2D(0, 0);

    let separationVel = new Vec2D(0, 0);
    for (let boid of neighbours) {
      separationVel = separationVel.subtract(boid.pos.subtract(this.pos));
    }
    return separationVel
      .multiply(this.coefficients.separation);
  }

  alignment(neighbours) {
    if (neighbours.length === 0) return new Vec2D(0, 0);

    let alignmentVel = new Vec2D(0, 0);
    for (let boid of neighbours) {
      alignmentVel = alignmentVel.add(boid.vel);
    }

    alignmentVel = alignmentVel.divide(neighbours.length);
    return alignmentVel
      .subtract(this.vel)
      .multiply(this.coefficients.alignment);
  }
}

class Field {
  constructor(context) {
    this.context = context;
    this.canvas = context.canvas;
  }

  clear() {
    this.context.beginPath();
    this.context.fillStyle = "rgba(0, 0, 0, )";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.closePath();
  }

  drawObstacles(obstacles) {
    for (let obstacle of obstacles) {
      this._drawSingleObstacle(obstacle);
    }
  }

  _drawSingleObstacle(obstacle) {
    this.context.save();
    this.context.beginPath();
    this.context.shadowColor = "violet";
    this.context.shadowBlur = 15;
    this.context.fillStyle = "black";
    this.context.fillRect(obstacle.pos.x, obstacle.pos.y, obstacle.dim.x, obstacle.dim.y)
    this.context.closePath();
    this.context.restore();
  }

  drawBoids(boids) {
    for (let boid of boids) {
      // Bouncing of the edges
      if (boid.pos.x < 10) {
        boid.pos.x = 10;
        boid.vel.x *= -1;
      }
      if (boid.pos.y < 10) {
        boid.pos.y = 10;
        boid.vel.y *= -1;
      }
      if (boid.pos.x > this.canvas.width - 10) {
        boid.pos.x = this.canvas.width - 10;
        boid.vel.x *= -1;
      }
      if (boid.pos.y > this.canvas.height - 10) {
        boid.pos.y = this.canvas.height - 10;
        boid.vel.y *= -1;
      }

      this._drawSingleBoid(boid);
    }
  }

  _drawSingleBoid(boid) {
    this.context.save();
    // Cohesion
    this.context.beginPath();
    this.context.arc(boid.pos.x, boid.pos.y, boid.radii.cohesion, 0, 2 * Math.PI);
    this.context.strokeStyle = "rgba(255, 255, 255, 0.05)";
    this.context.stroke();
    this.context.closePath();
    // Separation
    this.context.beginPath();
    this.context.arc(boid.pos.x, boid.pos.y, boid.radii.separation, 0, 2 * Math.PI);
    this.context.fillStyle = "rgba(255, 255, 255, 0.05)";
    this.context.fill();
    this.context.closePath();
    // Alignment
    this.context.beginPath();
    this.context.arc(boid.pos.x, boid.pos.y, boid.radii.alignment, 0, 2 * Math.PI);
    this.context.strokeStyle = "rgba(255, 255, 255, 0.1)";
    this.context.stroke();
    this.context.closePath();
    // Body
    this.context.beginPath();
    this.context.arc(boid.pos.x, boid.pos.y, boid.radius, 0, 2 * Math.PI);
    this.context.fillStyle = boid.color;
    this.context.fill();
    this.context.closePath();
    this.context.restore();
  }
}

// Generating boids
function randomBoids(N) {
  const boids = [];
  for (let i = 0; i < N; i++) {
    boids.push(
      new Boid(
        new Vec2D(Math.random() * 200, Math.random() * 200),
        new Vec2D(Math.random() * 2 - 1, Math.random() * 2 - 1),
        Math.floor(Math.random() * 2 + 4)
      )
    );
  }
  return boids;
}
function randomObstacles(N) {
  const obstacles = [];
  while(N--) {
    obstacles.push(
      new RectangularObstacle(
        new Vec2D(Math.random() * 1200, Math.random() * 400 + 200),
        new Vec2D(Math.random() * 20 + 80, Math.random() * 20 + 50)
      )
    );
  }
  return obstacles;
}

const radii = {
  cohesion: 80,
  separation: 20,
  alignment: 100
}

// Ranges
const cohesionRange = document.getElementById('cohesion-range');
cohesionRange.addEventListener('input', event => {
  radii.cohesion = parseInt(event.target.value);
});
const separationRange = document.getElementById('separation-range');
separationRange.addEventListener('input', event => {
  radii.separation = parseInt(event.target.value);
});
const alignmentRange = document.getElementById('alignment-range');
alignmentRange.addEventListener('input', event => {
  radii.alignment = parseInt(event.target.value);
});


// Canvas setting.
const canvas = document.getElementById("field");
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;

// DOM handling.
const field = new Field(document.getElementById("field").getContext("2d"));
const boids = randomBoids(100);
const obstacles = randomObstacles(5);
function updateCanvas() {
  field.clear();
  field.drawBoids(boids);
  field.drawObstacles(obstacles);
  for (let boid of boids) {
    boid.radii = radii;
    boid.collide(obstacles);
    boid.update(boids);
  }
  window.requestAnimationFrame(updateCanvas);
}

updateCanvas();
