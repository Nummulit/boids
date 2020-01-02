class Boid {
  constructor(
    position, 
    velocity, 
    radius = 5,
    maxVelocity = new Victor(3, 3 ),
    radiuses = { separation: 10, alignment: 100, cohesion: 20 },
    options = { color: 'ivory', borderColor: `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})` }
  ) {
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
    this.maxVelocity = maxVelocity;
    this.options = options;
    this.radiuses = radiuses;
  }

  draw = (context) => {
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);  // Radius minus the borderWidth.
    context.fillStyle = this.options.color;
    context.fill();
    context.strokeStyle = this.options.borderColor;
    context.lineWidth = 1;
    context.stroke();
    context.closePath();
  }

  move = () => {
    this.velocity.x = Math.max(-this.maxVelocity.x, Math.min(this.maxVelocity.x, this.velocity.x));
    this.velocity.y = Math.max(-this.maxVelocity.y, Math.min(this.maxVelocity.y, this.velocity.y));
    this.position.subtract(this.velocity);
  }

  isColliding(other) {
    return (this.position.distance(other.position) <= this.radius + other.radius);
  }

  nullifyOverlap(other) {
    const distance = this.position.distance(other.position);
    const overlap = Math.abs(this.radius + other.radius - distance);
    const _ = this.position.clone().subtract(other.position).length();
    const normal = this.position.clone().subtract(other.position).divide(new Victor(_, _));
  
    this.position
      .add(new Victor(overlap / 2, overlap / 2).multiply(normal));
    other.position
      .subtract(new Victor( overlap / 2, overlap / 2).multiply(normal));
  }

  collide(other) {
    // Mass is assumed to be radius squared, as in two dimension it could be proportional to area.
    const factor = 2 * other.radius ** 2 / (this.radius ** 2 + other.radius ** 2) 
      * (this.velocity.clone().subtract(other.velocity)).dot(this.position.clone().subtract(other.position)) 
      / this.position.clone().subtract(other.position).length() ** 2;
    
    this.velocity = 
      this.velocity.clone()
      .subtract(new Victor(factor, factor).multiply(this.position.clone().subtract(other.position)))
  }
}



function update(context, boids) {
  context.fillStyle = `rgba(0, 0, 0, 1)`;
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);

  for (let boid of boids) {
    boid.move();
    boid.draw(context);

    for (let boid2 of boids) {
      if (boid === boid2) continue;

      if (boid.isColliding(boid2)) {
        boid.nullifyOverlap(boid2);
        boid.collide(boid2);
      };
    }


    /* Boundary conditions. */
    if (boid.position.x < boid.radius || boid.position.x > canvas.width - boid.radius) {
      boid.velocity.x *= -1;
    }
    if (boid.position.y < boid.radius || boid.position.y > canvas.height - boid.radius) {
      boid.velocity.y *= -1;
    }
    boid.position.x = Math.max(boid.position.x, 0 + boid.radius);
    boid.position.y = Math.max(boid.position.y, 0 + boid.radius);
    boid.position.x = Math.min(boid.position.x, canvas.width - boid.radius);
    boid.position.y = Math.min(boid.position.y, canvas.height - boid.radius);
  }

  window.requestAnimationFrame(() => update(context, boids));
}


/* TESTING */
const N = 100;

const canvas = document.getElementById('field');
const context = canvas.getContext('2d');

const boids = [];
boids.push(new Boid(
  new Victor(Math.random() * canvas.width, Math.random() * canvas.height),
  new Victor(1, 1),
  100
));
for (let i = 0; i < N; i++) {
  const boid = new Boid(
    new Victor(Math.random() * canvas.width, Math.random() * canvas.height),
    new Victor(Math.random() * 1 + 1, Math.random() * 1 + 1),
    Math.floor(Math.random() * 10 + 5)
  );
  boids.push(boid);
}

update(context, boids);
