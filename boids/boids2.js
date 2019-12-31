class Boid {
  constructor(
    position, 
    velocity, 
    radius = 5,
    maxVelocity = {
      x: 3,
      y: 3,
    },
    radiuses = {
      separation: 10,
      alignment: 100,
      cohesion: 20
    },
    options = {
      color: 'white'
    }
  ) {
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
    this.maxVelocity = maxVelocity;
    this.options = options;
    this.radiuses = radiuses;

    // For testing only
    this._separationValue = 0;
  }

  draw = (context) => {
    // Separation 
      if (this._separationValue > 0) {
        // Circle
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radiuses.separation, 0, Math.PI * 2);
        context.closePath();
        context.strokeStyle = `white`;
        context.stroke();  
        // Color
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radiuses.separation, 0, Math.PI * 2);
        context.closePath();
        context.fillStyle = `rgba(255, 0, 0, ${this._separationValue * 0.3 + 0.3})`;
        context.fill();
      }
      
    // // All radiuses
    // for (let radius in this.radiuses) {
    //   context.beginPath();
    //   context.arc(this.position.x, this.position.y, this.radiuses[radius], 0, Math.PI * 2);
    //   context.closePath();
    //   context.fillStyle = `rgba(255, 255, 255, 0.1)`;
    //   context.fill();
    // }
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    context.closePath();
    context.fillStyle = this.options.color;
    context.fill();
  }

  move = () => {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  accelerate = () => {
    this.velocity.x = Math.max(-this.maxVelocity.x, Math.min(this.maxVelocity.x, 1.1 * this.velocity.x));
    this.velocity.y = Math.max(-this.maxVelocity.y, Math.min(this.maxVelocity.y, 1.1 * this.velocity.y));
  }

  collide = (boids) => {
    // TODO: FINISH IT PROPERLY.
    for (let boid of boids) {
      if (boid === this) continue;

      // Rectangle collision.
      const distanceX = boid.position.x - this.position.x;
      const distanceY = boid.position.y - this.position.y;
      // if (Math.abs(distanceX) > this.radiuses.alignment || Math.abs(distanceY) > this.radiuses.alignment) continue;

      // Circle collision.
      const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
      if (distance <= boid.radius + this.radius) {
        // const collisionPointX = ((this.position.x * boid.radius) + (boid.position.x * this.radius)) / (this.radius + boid.radius);
        // const collisionPointY = ((this.position.y * boid.radius) + (boid.position.y * this.radius)) / (this.radius + boid.radius);
        // collisionAt.textContent = `(${collisionPointX}, ${collisionPointY})`;

        // const overlap = boid.radius + this.radius - distance;


        // const newVelX = (this.velocity.x * (this.radius - boid.radius) + (2 * boid.radius * boid.velocity.x)) / (this.radius + boid.radius);
        // const newVelY = (this.velocity.y * (this.radius - boid.radius) + (2 * boid.radius * boid.velocity.y)) / (this.radius + boid.radius);

        // this.position.x += newVelX;
        // this.position.y += newVelY;

        // this.velocity.x = newVelX;
        // this.velocity.y = newVelY;
        this.velocity.x *= -1;
        this.velocity.y *= -1;
        boid.velocity.x *= -1;
        boid.velocity.y *= -1;
      }


      // const distance = Math.sqrt((boid.position.y - this.position.y) ** 2 + (boid.position.x - this.position.x) ** 2);
      // if (Math.abs(distance) <= boid.radius + this.radius) {
      //   // Moving outside
      //   const overlap = 0.5 * Math.abs(distance - boid.radius - this.radius);

      //   this.x -= overlap * (boid.position.x - this.position.x) / distance;
      //   this.y -= overlap * (boid.position.y - this.position.y) / distance;
      //   boid.x += overlap * (boid.position.x - this.position.x) / distance;
      //   boid.y += overlap * (boid.position.y - this.position.y) / distance;

      //   // Reflecting
      //   boid.velocity.x *= -1;
      //   boid.velocity.y *= -1;
      //   this.velocity.x *= -1;
      //   this.velocity.y *= -1;
      // }
    }
  }

  seperate = (boids) => {
    this._separationValue = 0;

    const distances = {
      x: [],
      y: []
    }
    for (let boid of boids) {
      if (this === boid) continue;

      const distance = Math.sqrt((boid.position.x - this.position.x) ** 2 + (boid.position.y - this.position.y) ** 2);
      if (distance < this.radiuses.separation + boid.radius) {
        const pushAwayFactor = distance / (this.radiuses.separation + boid.radius);

        // Tmp
        this._separationValue = 1 - pushAwayFactor;

        if (pushAwayFactor < 0 || pushAwayFactor > 1) {
          throw Error('Co jest...');
        }

        const seperateSpeedX = - (boid.position.x - this.position.x) / distance;
        const seperateSpeedY = - (boid.position.y - this.position.y) / distance;

        if (seperateSpeedX > 1 || seperateSpeedY > 1) {
          throw Error('...');
        }

        this.velocity.x = pushAwayFactor * this.velocity.x +
         (1 - pushAwayFactor) * seperateSpeedX;
        this.velocity.y = pushAwayFactor * this.velocity.y +
         (1 - pushAwayFactor) * seperateSpeedY;
      }
    }
  }

  align = (boids) => {
    const velocitiesX = [];
    const velocitiesY = [];

    for (let boid of boids) {
      if (this === boid) continue;

      const distanceX = boid.position.x - this.position.x;
      const distanceY = boid.position.y - this.position.y;
      if (Math.abs(distanceX) > this.radiuses.alignment || Math.abs(distanceY) > this.radiuses.alignment) continue;

      const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
      if (distance <= this.radiuses.alignment) {
        velocitiesX.push(boid.velocity.x);
        velocitiesY.push(boid.velocity.y);
      }
    }
    if (velocitiesX.length > 0) {
      const avgVelocityX = velocitiesX.reduce((a, b) => a + b, 0) / velocitiesX.length;
      this.velocity.x = 0.9 * this.velocity.x + 0.1 * avgVelocityX;
    }
    if (velocitiesY.length > 0) {
      const avgVelocityY = velocitiesY.reduce((a, b) => a + b, 0) / velocitiesY.length;
      this.velocity.y = 0.9 * this.velocity.y + 0.1 * avgVelocityY;
    }
  }

  applyCohesion = (boids) => {
    const positionsX = [];
    const positionsY = [];

    for (let boid of boids) {
      if (this === boid) continue;

      const distanceX = boid.position.x - this.position.x;
      const distanceY = boid.position.y - this.position.y;
      if (Math.abs(distanceX) > this.radiuses.cohesion || Math.abs(distanceY) > this.radiuses.cohesion) continue;

      const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
      if (distance < this.radiuses.cohesion) {
        positionsX.push(boid.position.x);
        positionsY.push(boid.position.y);
      }

      if (positionsX.length > 0) {
        const averageX = positionsX.reduce((a, b) => a + b, 0) / positionsX.length;
        const cohesionSpeedX = averageX - this.position.x;
        this.velocity.x = 0.5 * this.velocity.x + 0.5 * cohesionSpeedX;        
      }
      if (positionsY.length > 0) {
        const averageY = positionsY.reduce((a, b) => a + b, 0) / positionsY.length;
        const cohesionSpeedY = averageY - this.position.y;
        this.velocity.y = 0.5 * this.velocity.y + 0.5 * cohesionSpeedY;
      }
    }
  }
}















/// .......
function updateLoop(context, boids) {
  const canvas = context.canvas;
  // context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = `rgba(0, 0, 0, 1.3)`;
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let boid of boids) {

    // boid.collide(boids);
    boid.seperate(boids);
    boid.align(boids);
    // boid.applyCohesion(boids);

    boid.accelerate();
    boid.move();

    if (boid.position.x < 0) {
      boid.position.x = canvas.width;
    }
    if (boid.position.x > canvas.width) {
      boid.position.x = 0;
    }
    if (boid.position.y < 0) {
      boid.position.y = canvas.height;
    }
    if (boid.position.y > canvas.width) {
      boid.position.y = 0;
    }
    
    // if (boid.position.x < boid.radius || boid.position.x > canvas.width - boid.radius) {
    //   boid.velocity.x *= -1;
    // }
    // if (boid.position.y < boid.radius || boid.position.y > canvas.height - boid.radius) {
    //   boid.velocity.y *= -1;
    // }
    // boid.position.x = Math.max(boid.position.x, 0 + boid.radius);
    // boid.position.y = Math.max(boid.position.y, 0 + boid.radius);
    // boid.position.x = Math.min(boid.position.x, canvas.width - boid.radius);
    // boid.position.y = Math.min(boid.position.y, canvas.height - boid.radius);

    boid.draw(context);

    // Number of boids
    const num = boids.filter(boid => {
      return (boid.position.x > 0 && boid.position.x < canvas.width && boid.position.y > 0 && boid.position.y < canvas.height);
    })
    numberOfBoids.textContent = `${num.length}`;

  }
  let raf = window.requestAnimationFrame(() => updateLoop(context, boids));
}


const numberOfBoids = document.getElementById('number-of-boids');
const collisionAt = document.getElementById('collision-at');

const canvas = document.getElementById('field');
const ctx = canvas.getContext('2d');
const boids = [];
const N = 100;
for (let i = 0; i < N; i++) {
  const boid = new Boid(
    // { x: canvas.width / 2 + Math.random() * 20 - 10, y: canvas.height / 2 + Math.random() * 20 - 10  },
    { x: Math.random() * canvas.width, y: Math.random() * canvas.height },
    { x: Math.random() * 4 - 2, y: Math.random() * 4 - 2 }
  );
  boids.push(boid);
}

updateLoop(ctx, boids);


