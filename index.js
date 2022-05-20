const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const score = document.querySelector("#score");
const modelEl = document.querySelector("#modelEl");
const endScore = document.querySelector("#endScore");
const btnEl = document.querySelector("#btnEl");

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

const friction = 0.99;
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }

  darw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.darw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  }
}

// main
const x = canvas.width / 2;
const y = canvas.height / 2;

let player = new Player(x, y, 10, "white");
let projectiles = [];
let enemies = [];
let particles = [];
let animationId;
let intervalId;
let scoreAdd = 0;

function init() {
  player = new Player(x, y, 10, "white");
  projectiles = [];
  enemies = [];
  particles = [];
  animationId;
  scoreAdd = 0;
}

function spawnEnemies() {
  intervalId = setInterval(() => {
    const radius = Math.random() * 30 + 20;

    let x, y;
    if (Math.random() < 0.5) {
      x = Math.random() > 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() > 0.5 ? 0 - radius : canvas.height + radius;
    }
    const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };

    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 1000);
}

function animate() {
  animationId = requestAnimationFrame(animate);
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.darw();
  for (let index = particles.length - 1; index >= 0; index--) {
    const particle = particles[index];
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      particle.update();
    }
  }
  for (let index = projectiles.length - 1; index >= 0; index--) {
    const projectile = projectiles[index];
    projectile.update();
    // remove from edges of screen
    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      projectiles.splice(index, 1);
    }
  }

  for (let index = enemies.length - 1; index >= 0; index--) {
    const enemy = enemies[index];

    enemy.update();

    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    // end game
    if (dist - enemy.radius - player.radius < 0.1) {
      cancelAnimationFrame(animationId);
      clearInterval(intervalId);
      endScore.innerHTML = scoreAdd;
      modelEl.style.display = "block";
    }
    for (
      let projectilesIndex = projectiles.length - 1;
      projectilesIndex >= 0;
      projectilesIndex--
    ) {
      const projectile = projectiles[projectilesIndex];
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
      // when projectile touch enemy
      if (dist - enemy.radius - projectile.radius < 1) {
        // create explosions
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 8),
                y: (Math.random() - 0.5) * (Math.random() * 6),
              }
            )
          );
        }
        // this is where we shrink our enemy
        if (enemy.radius - 10 > 5) {
          console.log(scoreAdd);
          scoreAdd += 100;
          score.innerHTML = scoreAdd;
          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });

          projectiles.splice(projectilesIndex, 1);
        } else {
          // remove enemy if they are too small
          scoreAdd += 150;
          score.innerHTML = scoreAdd;
          enemies.splice(index, 1);
          projectiles.splice(projectilesIndex, 1);
        }
      }
    }
  }
}

window.addEventListener("click", (e) => {
  const angle = Math.atan2(e.clientY - y, e.clientX - x);
  const velocity = {
    x: Math.cos(angle) * 6,
    y: Math.sin(angle) * 6,
  };
  projectiles.push(new Projectile(x, y, 5, "white", velocity));
});

btnEl.addEventListener("click", () => {
  init();
  modelEl.style.display = "none";
  spawnEnemies();
  animate();
});

animate();
spawnEnemies();
