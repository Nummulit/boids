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

class Boid {
  constructor(
    pos,
    vel,
    radius,
    radii = { cohesion: 80, separation: 20, alignment: 100 },
    coefficients = { cohesion: 0.001, separation: 0.1, alignment: 0.01 }
  ) {
    this.pos = pos;
    this.vel = vel;
    this.radius = radius;
    this.radii = radii;
    this.coefficients = coefficients;
  }

  neighbours(boids, radius) {
    return boids.filter(
      boid => this !== boid && this.pos.subtract(boid.pos).norm() < radius
    );
  }

  update(boids) {
    // For optimization we will sort the radii in descending order so the smaller ones will
    // search only through previously filtered nodes.
    const sortedRadii = Object.entries(this.radii).sort((prev, next) => prev[1] < next[1]);
    let neighbours = boids;
    for (let [ruleName, radius] of sortedRadii) {
      neighbours = this.neighbours(neighbours, radius);
      this.vel = this.vel.add(this[ruleName](neighbours))
    }
    
    const maxSpeed = 3;
    if (this.vel.norm() > maxSpeed) {
      this.vel = this.vel.divide(this.vel.norm()).multiply(maxSpeed);
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
    this.context.fillStyle = "rgba(0, 0, 0, 1)";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  draw(boids) {
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
    this.context.fillStyle = "rgba(0, 255, 0, 1)";
    this.context.fill();
    this.context.closePath();
  }
}

// Generating boids
function randomBoids(N) {
  const boids = [];
  for (let i = 0; i < N; i++) {
    boids.push(
      new Boid(
        new Vec2D(Math.random() * 600, Math.random() * 600),
        new Vec2D(Math.random() * 2 - 1, Math.random() * 2 - 1),
        Math.floor(Math.random() * 2 + 8)
      )
    );
  }
  return boids;
}

// DOM handling
const field = new Field(document.getElementById("field").getContext("2d"));
const boids = randomBoids(100);
function updateCanvas() {
  field.clear();
  field.draw(boids);
  for (let boid of boids) {
    boid.update(boids);
  }
  window.requestAnimationFrame(updateCanvas);
}

updateCanvas();
