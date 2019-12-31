class Ball {
  constructor(x, y, vx, vy, radius = 5, color = 'tomato') {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.color = color;
  }

  draw = (context) => {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.closePath();
    context.fillStyle = this.color;
    context.fill();
  }

  move = () => {
    this.x += this.vx;
    this.y += this.vy;
  }
}


function draw(context, balls) {
  const canvas = context.canvas;
  context.clearRect(0, 0, canvas.width, canvas.height);
  // context.fillStyle = `rgba(0, 0, 0, 0.3)`;
  // context.fillRect(0, 0, canvas.width, canvas.height);

  for (let ball of balls) {
    ball.draw(context);
    ball.move();

    if (ball.x < ball.radius || ball.x > canvas.width - ball.radius) {
      ball.vx *= -1;
    }
    if (ball.y < ball.radius || ball.y > canvas.height - ball.radius) {
      ball.vy *= -1;
    }
  }
  let raf = window.requestAnimationFrame(() => draw(context, balls));
}


const canvas = document.getElementById('field');
const ctx = canvas.getContext('2d');

const balls = [];
const N = 300;
for (let i = 0; i < N; i++) {
  balls.push(
    new Ball(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      Math.random() * 6 - 2,
      Math.random() * 6 - 2,
      Math.random() * 4 + 5,
      `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.5)`
    )
  );
}

draw(ctx, balls);



