const {
  Engine, World, Bodies, Body, Events, Composite, Vector, Runner
} = Matter;

const COLS = 10;
const ROWS = 6;
const BRICK_W = 70;
const BRICK_H = 28;
const PADDLE_W = 120;
const PADDLE_H = 16;
const BALL_R = 9;
const WALL = 20;
const CANVAS_W = COLS * BRICK_W + WALL * 2;
const CANVAS_H = 560;

const COLORS = ['#e94560', '#f5a623', '#f7d44a', '#4ecdc4', '#45b7d1', '#96ceb4'];

let score = 0;
let lives = 3;
let gameState = 'menu';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;

const engine = Engine.create({ gravity: { x: 0, y: 0 } });
const world = engine.world;

let paddle, ball, bricks = [];
let isLaunching = true;

function createWalls() {
  const opts = { isStatic: true, restitution: 1, friction: 0, label: 'wall' };
  const thick = 60;
  return [
    Bodies.rectangle(CANVAS_W / 2, -thick / 2, CANVAS_W + 200, thick, opts),
    Bodies.rectangle(-thick / 2, CANVAS_H / 2, thick, CANVAS_H + 200, opts),
    Bodies.rectangle(CANVAS_W + thick / 2, CANVAS_H / 2, thick, CANVAS_H + 200, opts),
  ];
}

function createPaddle() {
  return Bodies.rectangle(CANVAS_W / 2, CANVAS_H - 40, PADDLE_W, PADDLE_H, {
    isStatic: true, label: 'paddle', chamfer: { radius: 4 }
  });
}

function createBall() {
  return Bodies.circle(CANVAS_W / 2, CANVAS_H - 70, BALL_R, {
    restitution: 1, friction: 0, frictionAir: 0, density: 0.002, label: 'ball'
  });
}

function createBricks() {
  const bricks = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = WALL + col * BRICK_W + BRICK_W / 2;
      const y = 80 + row * BRICK_H + BRICK_H / 2;
      const brick = Bodies.rectangle(x, y, BRICK_W - 4, BRICK_H - 4, {
        isStatic: true, label: 'brick', chamfer: { radius: 3 },
        render: { color: COLORS[row % COLORS.length] }
      });
      brick.row = row;
      brick.col = col;
      bricks.push(brick);
    }
  }
  return bricks;
}

function launchBall() {
  const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
  const speed = 7;
  Body.setVelocity(ball, { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed });
  isLaunching = false;
}

function resetBall() {
  Body.setPosition(ball, { x: CANVAS_W / 2, y: CANVAS_H - 70 });
  Body.setVelocity(ball, { x: 0, y: 0 });
  isLaunching = true;
}

function setup() {
  Composite.clear(world, false);

  const walls = createWalls();
  paddle = createPaddle();
  ball = createBall();
  bricks = createBricks();

  Composite.add(world, [...walls, paddle, ball, ...bricks]);
}

Events.on(engine, 'collisionStart', (event) => {
  for (const pair of event.pairs) {
    const { bodyA, bodyB } = pair;
    const brick = bodyA.label === 'brick' ? bodyA : bodyB.label === 'brick' ? bodyB : null;

    if (brick && bricks.includes(brick)) {
      Composite.remove(world, brick);
      bricks = bricks.filter(b => b !== brick);
      score += 10;
      document.getElementById('score').textContent = score;

      if (bricks.length === 0) {
        endGame('win');
      }
    }

    if (bodyA.label === 'ball' && bodyB.label === 'paddle' ||
        bodyB.label === 'ball' && bodyA.label === 'paddle') {
      const p = bodyA.label === 'paddle' ? bodyA : bodyB;
      const b = bodyA.label === 'ball' ? bodyA : bodyB;
      const diff = b.position.x - p.position.x;
      const angle = -Math.PI / 2 + (diff / (PADDLE_W / 2)) * 0.8;
      const speed = Math.sqrt(b.velocity.x ** 2 + b.velocity.y ** 2) || 7;
      Body.setVelocity(b, { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed });
    }
  }
});

Events.on(engine, 'beforeUpdate', () => {
  if (gameState !== 'playing') return;

  if (ball.position.y > CANVAS_H + 50) {
    lives--;
    document.getElementById('lives').textContent = lives;
    if (lives <= 0) {
      endGame('lose');
    } else {
      resetBall();
    }
  }

  if (Math.abs(ball.velocity.x) < 0.1) {
    Body.setVelocity(ball, { x: 1 + Math.random() * 2, y: ball.velocity.y });
  }
  if (Math.abs(ball.velocity.y) < 0.1) {
    Body.setVelocity(ball, { x: ball.velocity.x, y: -4 });
  }
});

function endGame(result) {
  gameState = 'over';
  const overlay = document.getElementById('overlay');
  overlay.classList.remove('hidden');
  document.getElementById('overlay-title').textContent = result === 'win' ? 'Victoire !' : 'Game Over';
  document.getElementById('overlay-message').textContent =
    result === 'win' ? `Bravo ! Score: ${score}` : `Score final: ${score}`;
  document.getElementById('overlay-btn').textContent = 'Rejouer';
}

function draw() {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  for (const body of Composite.allBodies(world)) {
    if (body.label === 'wall') continue;

    const verts = body.vertices;
    ctx.beginPath();
    ctx.moveTo(verts[0].x, verts[0].y);
    for (let i = 1; i < verts.length; i++) {
      ctx.lineTo(verts[i].x, verts[i].y);
    }
    ctx.closePath();

    if (body.label === 'brick') {
      ctx.fillStyle = body.render?.color || '#e94560';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (body.label === 'paddle') {
      ctx.fillStyle = '#e94560';
      ctx.shadowColor = '#e94560';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (body.label === 'ball') {
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  if (isLaunching && gameState === 'playing') {
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(ball.position.x, ball.position.y);
    ctx.lineTo(ball.position.x, ball.position.y + 60);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function gameLoop() {
  if (gameState === 'playing') {
    Engine.update(engine, 1000 / 60);
  }
  draw();
  requestAnimationFrame(gameLoop);
}

document.addEventListener('mousemove', (e) => {
  if (gameState !== 'playing') return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = CANVAS_W / rect.width;
  const mx = (e.clientX - rect.left) * scaleX;
  const clamped = Math.max(PADDLE_W / 2, Math.min(CANVAS_W - PADDLE_W / 2, mx));
  Body.setPosition(paddle, { x: clamped, y: paddle.position.y });

  if (isLaunching) {
    Body.setPosition(ball, { x: clamped, y: ball.position.y });
  }
});

document.addEventListener('click', () => {
  if (gameState === 'playing' && isLaunching) {
    launchBall();
  }
});

document.getElementById('overlay-btn').addEventListener('click', () => {
  document.getElementById('overlay').classList.add('hidden');
  score = 0;
  lives = 3;
  gameState = 'playing';
  document.getElementById('score').textContent = '0';
  document.getElementById('lives').textContent = '3';
  setup();
  resetBall();
});

setup();
gameLoop();
