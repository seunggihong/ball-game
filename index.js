const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  darw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  darw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.darw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  darw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.darw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

// main
const x = canvas.width / 2;
const y = canvas.height / 2;

const player = new Player(x, y, 30, "blue");
const projectiles = [];
const enemies = [];

function spawnEnemies() {
  setInterval(() => {
    const radius = Math.random() * 30;

    let x, y;
    if (Math.random() < 0.5) {
      x = Math.random() > 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() > 0.5 ? 0 - radius : canvas.height + radius;
    }
    const color = "green";

    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };

    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 1000);
}
let animationId;
function animate() {
  animationId = requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  player.darw();
  projectiles.forEach((projectile) => {
    projectile.update();
  });
  enemies.forEach((enemy, index) => {
    enemy.update();
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    // end game
    if (dist - enemy.radius - player.radius < 0.1) {
      cancelAnimationFrame(animationId);
    }
    projectiles.forEach((projectile, projectilesIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
      // object touch
      if (dist - enemy.radius - projectile.radius < 1) {
        setTimeout(() => {
          enemies.splice(index, 1);
          projectiles.splice(projectilesIndex, 1);
        }, 0);
      }
    });
  });
}

window.addEventListener("click", (e) => {
  const angle = Math.atan2(e.clientY - y, e.clientX - x);
  const velocity = {
    x: Math.cos(angle),
    y: Math.sin(angle),
  };
  projectiles.push(new Projectile(x, y, 5, "red", velocity));
});

animate();
spawnEnemies();
