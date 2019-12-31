class Boid {
  constructor(x, y, vx, vy, radius = 5, viewRadius = 15, color = 'gold') {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.viewRadius = viewRadius;
    this.color = color;
  }

  draw = (context) => {
    // The dot.
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.closePath();
    context.fillStyle = this.color;
    context.fill();
    // The view.
    context.beginPath();
    context.arc(this.x, this.y, this.viewRadius, 0, Math.PI * 2);
    context.closePath();
    context.fillStyle = this.isCrowded ? `rgba(255, 0, 0, 0.1)`: `rgba(255, 255, 255, 0.1)`;
    context.fill();
    // Draw velocities.
    context.beginPath();
    context.moveTo(this.x, this.y);
    context.strokeStyle = 'red';
    context.lineWidth = 3;
    context.lineTo(this.x + 10 * this.vx, this.y + 10 * this.vy);
    context.stroke();
  }

  move = () => {
    this.x += this.vx;
    this.y += this.vy;
  }

  collide = (boids) => {
    // TODO: FINISH IT PROPERLY.
    for (let boid of boids) {
      if (boid === this) continue;

      const distance = Math.sqrt((boid.y - this.y) ** 2 + (boid.x - this.x) ** 2);
      if (Math.abs(distance) <= boid.radius + this.radius) {
        // Moving outside
        const overlap = 0.5 * Math.abs(distance - boid.radius - this.radius);

        this.x -= overlap * (boid.x - this.x) / distance;
        this.y -= overlap * (boid.y - this.y) / distance;
        boid.x += overlap * (boid.x - this.x) / distance;
        boid.y += overlap * (boid.y - this.y) / distance;

        // Reflecting
        boid.vx *= -1;
        boid.vy *= -1;
        this.vx *= -1;
        this.vy *= -1;
      }
    }
  }

  separate = (boids) => {
    // this.isCrowded = false;
    const MAX_SPEED = 2;

    const distancesX = [];
    const distancesY = [];

    for (let boid of boids) {
      if (this === boid) continue;

      // If it's not in the square then it won't be in the circle.
      const distanceX = boid.x - this.x;
      const distanceY = boid.y - this.y;
      if (Math.abs(distanceX) > this.viewRadius || Math.abs(distanceY) > this.viewRadius) continue;

      const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
      if (distance <= this.viewRadius) {
        // this.isCrowded = true;
        distancesX.push(distanceX);
        distancesY.push(distanceY);
      }
    }

    if (distancesX.length > 0) {
      const avgDistanceX = distancesX.reduce((a, b) => a + b, 0) / distancesX.length;
      // this.vx = - 0.3 * Math.max(-MAX_SPEED, Math.min(MAX_SPEED, this.viewRadius / avgDistanceX));
      this.vx -= 0.3 * this.viewRadius / avgDistanceX;
      this.vx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, this.vx));
    } 
    if (distancesY.length > 0) {
      const avgDistanceY = distancesY.reduce((a, b) => a + b, 0) / distancesY.length;
      // this.vy = - 0.3 * Math.max(-MAX_SPEED, Math.min(MAX_SPEED, this.viewRadius / avgDistanceY));
      this.vy -= 0.3 * this.viewRadius / avgDistanceY;
      this.vy = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, this.vy));
    }
  }

  align = (boids) => {
    const MAX_SPEED = 2;

    const velocitiesX = [];
    const velocitiesY = [];
    for (let boid of boids) {
      if (this === boid) continue;

      const distanceX = boid.x - this.x;
      const distanceY = boid.y - this.y;
      if (Math.abs(distanceX) > this.viewRadius || Math.abs(distanceY) > this.viewRadius) continue;

      const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
      if (distance <= this.viewRadius * 4) {
        velocitiesX.push(boid.vx);
        velocitiesY.push(boid.vy);
      }
    }
    if (velocitiesX.length > 0) {
      const avgVelocityX = velocitiesX.reduce((a, b) => a + b, 0) / velocitiesX.length;
      this.vx += 1 * avgVelocityX;
      this.vx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, this.vx));
    }
    if (velocitiesY.length > 0) {
      const avgVelocityY = velocitiesY.reduce((a, b) => a + b, 0) / velocitiesY.length;
      this.vy += 1 * avgVelocityY;
      this.vy = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, this.vy));
    }
  }

  applyCohesion = (boids) => {
    const MAX_SPEED = 2;

    const positionsX = [];
    const positionsY = [];
    for (let boid of boids) {
      if (this === boid) continue;

      const distanceX = boid.x - this.x;
      const distanceY = boid.y - this.y;
      if (Math.abs(distanceX) > this.viewRadius || Math.abs(distanceY) > this.viewRadius) continue;

      const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
      if (distance <= this.viewRadius) {
        positionsX.push(boid.x);
        positionsY.push(boid.y);
      }

      if (positionsX.length > 0) {
        const averageX = positionsX.reduce((a, b) => a + b, 0) / positionsX.length;
        this.vx += 0.05 * (averageX - this.x)
        this.vx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, this.vx));
      }
      if (positionsY.length > 0) {
        const averageY = positionsY.reduce((a, b) => a + b, 0) / positionsY.length;
        this.vy += 0.05 * (averageY - this.y)
        this.vy = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, this.vy));
      }
      
    }
  }
}


function draw(context, boids) {
  const canvas = context.canvas;
  // context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = `rgba(0, 0, 0, 1.3)`;
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let boid of boids) {

    boid.separate(boids);
    // boid.align(boids);
    // boid.applyCohesion(boids);
    // boid.collide(boids);

    boid.move();

    if (boid.x < boid.radius || boid.x > canvas.width - boid.radius) {
      boid.vx *= -1;
    }
    if (boid.y < boid.radius || boid.y > canvas.height - boid.radius) {
      boid.vy *= -1;
    }
    boid.x = Math.max(boid.x, 0 + boid.radius);
    boid.y = Math.max(boid.y, 0 + boid.radius);
    boid.x = Math.min(boid.x, canvas.width - boid.radius);
    boid.y = Math.min(boid.y, canvas.height - boid.radius);

    boid.draw(context);
  }
  let raf = window.requestAnimationFrame(() => draw(context, boids));
}

const canvas = document.getElementById('field');
const ctx = canvas.getContext('2d');

const boids = [];
const N = 10;
for (let i = 0; i < N; i++) {
  boids.push(new Boid(
    Math.random() * canvas.width, 
    Math.random() * canvas.height,
    // 300 + Math.random() * 100,
    // 300 + Math.random() * 100,
    Math.random() * 0.2, 
    Math.random() * .2,
    5
    ));
}
boids.push(
  new Boid(canvas.width / 2 + Math.random() * 50, canvas.height / 2 + Math.random() * 50, .2, .2, 5, 15, 'blue')
);

draw(ctx, boids);