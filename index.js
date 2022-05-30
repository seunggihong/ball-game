const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const score = document.querySelector("#score");
const modelEl = document.querySelector("#modelEl");
const endScore = document.querySelector("#endScore");
const btnEl = document.querySelector("#btnEl");
const gameLv = document.querySelector("#gameLv");
const startModelEl = document.querySelector("#startModelEl");
const startBtn = document.querySelector("#startBtn");

canvas.width = innerWidth;
canvas.height = innerHeight;

class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = {
      x: 0,
      y: 0,
    };
  }

  darw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.darw();

    const friction = 0.99;

    this.velocity.x *= friction;
    this.velocity.y *= friction;
    // collision detection for x axis
    if (
      this.x + this.radius + this.velocity.x <= canvas.width &&
      this.x - this.radius + this.velocity.x >= 0
    ) {
      this.x += this.velocity.x;
    } else {
      this.velocity.x = 0;
    }
    // collision detection for y axis
    if (
      this.y + this.radius + this.velocity.y <= canvas.height &&
      this.y - this.radius + this.velocity.y >= 0
    ) {
      this.y += this.velocity.y;
    } else {
      this.velocity.y = 0;
    }
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
    this.type = "Linear";
    this.radians = 0;
    this.center = {
      x,
      y,
    };

    // random homing
    if (Math.random() < 0.5) {
      this.type = "Homing";

      if (Math.random() < 0.5) {
        this.type = "Spinning";
      }
    }
  }

  darw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.darw();

    if (this.type === "Spinning") {
      this.radians += 0.1;

      this.center.x += this.velocity.x;
      this.center.y += this.velocity.y;

      this.x = this.center.x + Math.cos(this.radians) * 30;
      this.y = this.center.y + Math.sin(this.radians) * 30;
    } else if (this.type === "Homing") {
      // homing enemys
      const angle = Math.atan2(player.y - this.y, player.x - this.x);
      this.velocity.x = Math.cos(angle);
      this.velocity.y = Math.sin(angle);

      this.x = this.x + this.velocity.x;
      this.y = this.y + this.velocity.y;
    } else {
      // linear movment
      this.x = this.x + this.velocity.x;
      this.y = this.y + this.velocity.y;
    }
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
let gameLevel = 1;
let spawnEnemieRadius = 20;

function init() {
  player = new Player(x, y, 10, "white");
  projectiles = [];
  enemies = [];
  particles = [];
  animationId;
  scoreAdd = 0;
  gameLevel = 1;
  spawnEnemieRadius = 20;
  score.innerHTML = scoreAdd;
  gameLv.innerHTML = gameLevel;
}

function spawnEnemies() {
  intervalId = setInterval(() => {
    const radius = Math.random() * 30 + spawnEnemieRadius;
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
  }, 1500);
}

function animate() {
  animationId = requestAnimationFrame(animate);
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  player.update();

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
      gsap.fromTo(
        "#modelEl",
        {
          scale: 0.8,
          opacity: 0,
        },
        { scale: 1, opacity: 1, ease: "expo" }
      );
    }
    for (
      let projectilesIndex = projectiles.length - 1;
      projectilesIndex >= 0;
      projectilesIndex--
    ) {
      const projectile = projectiles[projectilesIndex];
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
      // game level contrall
      if (scoreAdd == 1000 * gameLevel) {
        if (gameLevel != 20) {
          gameLevel += 1;
          gameLv.innerHTML = gameLevel;
          spawnEnemieRadius -= 1;
        }
      }
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
          scoreAdd += 100;
          score.innerHTML = scoreAdd;
          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });

          projectiles.splice(projectilesIndex, 1);
        } else {
          // remove enemy if they are too small
          scoreAdd += 100;
          score.innerHTML = scoreAdd;
          enemies.splice(index, 1);
          projectiles.splice(projectilesIndex, 1);
        }
      }
    }
  }
}

window.addEventListener("click", (e) => {
  const angle = Math.atan2(e.clientY - player.y, e.clientX - player.x);
  const velocity = {
    x: Math.cos(angle) * 8,
    y: Math.sin(angle) * 8,
  };
  projectiles.push(new Projectile(player.x, player.y, 5, "white", velocity));
});

// restart btn event listener
btnEl.addEventListener("click", () => {
  init();
  spawnEnemies();
  animate();
  gsap.to("#modelEl", {
    opacity: 0,
    scale: 0.8,
    duration: 0.3,
    ease: "expo.in",
    onComplete: () => {
      modelEl.style.display = "none";
    },
  });
});

// start btn event listener
startBtn.addEventListener("click", () => {
  init();
  animate();
  spawnEnemies();
  gsap.to("#startModelEl", {
    opacity: 0,
    scale: 0.8,
    duration: 0.3,
    ease: "expo.in",
    onComplete: () => {
      startModelEl.style.display = "none";
    },
  });
});

window.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowRight":
      player.velocity.x += 1;
      break;
    case "ArrowUp":
      player.velocity.y -= 1;
      break;
    case "ArrowLeft":
      player.velocity.x -= 1;
      break;
    case "ArrowDown":
      player.velocity.y += 1;
      break;
  }
});
