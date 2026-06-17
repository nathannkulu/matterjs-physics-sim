const {
  Engine, World, Bodies, Body, Events, Composite, Vector, Constraint, Mouse, MouseConstraint
} = Matter;

const W = 1000;
const H = 640;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = W;
canvas.height = H;

const engine = Engine.create({ gravity: { x: 0, y: 1 } });
const world = engine.world;

let shapeMode = 'box';
let bodyCount = 0;

const colors = ['#6c5ce7', '#fd79a8', '#00cec9', '#fdcb6e', '#e17055', '#00b894', '#0984e3', '#e84393'];

function randomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createGround() {
  const ground = Bodies.rectangle(W / 2, H + 30, W + 200, 80, { isStatic: true, label: 'ground' });
  const leftWall = Bodies.rectangle(-30, H / 2, 60, H + 200, { isStatic: true, label: 'wall' });
  const rightWall = Bodies.rectangle(W + 30, H / 2, 60, H + 200, { isStatic: true, label: 'wall' });
  Composite.add(world, [ground, leftWall, rightWall]);
}

function spawnBox(x, y) {
  const size = randomInt(20, 50);
  const body = Bodies.rectangle(x, y, size, size, {
    restitution: 0.1,
    friction: 0.6,
    density: 0.002,
    chamfer: { radius: 2 },
    render: { fillStyle: randomColor() }
  });
  Composite.add(world, body);
  bodyCount++;
  return body;
}

function spawnCircle(x, y) {
  const r = randomInt(10, 28);
  const body = Bodies.circle(x, y, r, {
    restitution: 0.4,
    friction: 0.3,
    density: 0.002,
    render: { fillStyle: randomColor() }
  });
  Composite.add(world, body);
  bodyCount++;
  return body;
}

function spawnPolygon(x, y) {
  const sides = randomInt(5, 8);
  const r = randomInt(18, 35);
  const body = Bodies.polygon(x, y, sides, r, {
    restitution: 0.15,
    friction: 0.5,
    density: 0.002,
    chamfer: { radius: 2 },
    render: { fillStyle: randomColor() }
  });
  Composite.add(world, body);
  bodyCount++;
  return body;
}

function spawnRagdoll(x, y) {
  const parts = [];
  const head = Bodies.circle(x, y - 40, 16, {
    restitution: 0.2, friction: 0.5, render: { fillStyle: '#fd79a8' }
  });
  const torso = Bodies.rectangle(x, y, 32, 50, {
    restitution: 0.1, friction: 0.5, chamfer: { radius: 3 }, render: { fillStyle: '#6c5ce7' }
  });
  const armL = Bodies.rectangle(x - 28, y - 8, 22, 10, {
    restitution: 0.1, friction: 0.5, chamfer: { radius: 2 }, render: { fillStyle: '#a29bfe' }
  });
  const armR = Bodies.rectangle(x + 28, y - 8, 22, 10, {
    restitution: 0.1, friction: 0.5, chamfer: { radius: 2 }, render: { fillStyle: '#a29bfe' }
  });
  const legL = Bodies.rectangle(x - 12, y + 42, 14, 28, {
    restitution: 0.1, friction: 0.5, chamfer: { radius: 2 }, render: { fillStyle: '#74b9ff' }
  });
  const legR = Bodies.rectangle(x + 12, y + 42, 14, 28, {
    restitution: 0.1, friction: 0.5, chamfer: { radius: 2 }, render: { fillStyle: '#74b9ff' }
  });

  parts.push(head, torso, armL, armR, legL, legR);

  Composite.add(world, parts);

  const constraints = [
    { bodyA: head, bodyB: torso, pointA: { x: 0, y: 16 }, pointB: { x: 0, y: -25 } },
    { bodyA: torso, bodyB: armL, pointA: { x: 0, y: -8 }, pointB: { x: 11, y: 0 } },
    { bodyA: torso, bodyB: armR, pointA: { x: 0, y: -8 }, pointB: { x: -11, y: 0 } },
    { bodyA: torso, bodyB: legL, pointA: { x: 0, y: 25 }, pointB: { x: 7, y: 0 } },
    { bodyA: torso, bodyB: legR, pointA: { x: 0, y: 25 }, pointB: { x: -7, y: 0 } },
  ];

  for (const c of constraints) {
    Composite.add(world, Constraint.create({
      ...c,
      stiffness: 0.9,
      damping: 0.2,
      render: { visible: false }
    }));
  }

  bodyCount += parts.length;
  return parts;
}

function clearAll() {
  const bodies = Composite.allBodies(world);
  const staticBodies = bodies.filter(b => b.label === 'ground' || b.label === 'wall');
  Composite.clear(world, false);
  Composite.add(world, staticBodies);
  bodyCount = 0;
}

function getShapeAt(mx, my) {
  const bodies = Composite.allBodies(world);
  for (let i = bodies.length - 1; i >= 0; i--) {
    if (bodies[i].label === 'ground' || bodies[i].label === 'wall') continue;
    if (Matter.Vertices.contains(bodies[i].vertices, { x: mx, y: my })) {
      return bodies[i];
    }
  }
  return null;
}

let dragBody = null;
let dragOffset = { x: 0, y: 0 };

canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (W / rect.width);
  const my = (e.clientY - rect.top) * (H / rect.height);

  const clicked = getShapeAt(mx, my);
  if (clicked && clicked.label !== 'ground' && clicked.label !== 'wall') {
    dragBody = clicked;
    dragOffset.x = clicked.position.x - mx;
    dragOffset.y = clicked.position.y - my;
    Body.setStatic(clicked, true);
    return;
  }

  switch (shapeMode) {
    case 'box': spawnBox(mx, my); break;
    case 'circle': spawnCircle(mx, my); break;
    case 'polygon': spawnPolygon(mx, my); break;
    case 'ragdoll': spawnRagdoll(mx, my); break;
  }
  updateCount();
});

canvas.addEventListener('mousemove', (e) => {
  if (!dragBody) return;
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (W / rect.width);
  const my = (e.clientY - rect.top) * (H / rect.height);
  Body.setPosition(dragBody, { x: mx + dragOffset.x, y: my + dragOffset.y });
});

canvas.addEventListener('mouseup', () => {
  if (dragBody) {
    Body.setStatic(dragBody, false);
    dragBody = null;
  }
});

document.querySelectorAll('#toolbar button[data-shape]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#toolbar button[data-shape]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    shapeMode = btn.dataset.shape;
  });
});

document.getElementById('clear-btn').addEventListener('click', () => {
  clearAll();
  updateCount();
});

function updateCount() {
  document.getElementById('count').textContent = `Bodies: ${bodyCount}`;
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  const bodies = Composite.allBodies(world);

  for (const body of bodies) {
    if (body.label === 'ground' || body.label === 'wall') {
      ctx.fillStyle = '#1a1a3e';
      ctx.beginPath();
      const v = body.vertices;
      ctx.moveTo(v[0].x, v[0].y);
      for (let i = 1; i < v.length; i++) ctx.lineTo(v[i].x, v[i].y);
      ctx.closePath();
      ctx.fill();
      continue;
    }

    const color = body.render?.fillStyle || '#6c5ce7';
    const verts = body.vertices;

    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(verts[0].x, verts[0].y);
    for (let i = 1; i < verts.length; i++) ctx.lineTo(verts[i].x, verts[i].y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    if (body.label === 'Circle Body') {
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(body.position.x, body.position.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fill();
    }
  }

  ctx.shadowBlur = 0;

  if (dragBody) {
    ctx.beginPath();
    ctx.moveTo(dragBody.position.x, dragBody.position.y);
    const rect = canvas.getBoundingClientRect();
    const mx = (lastMouseX ?? 0) - rect.left;
    const my = (lastMouseY ?? 0) - rect.top;
    ctx.lineTo(mx, my);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

let lastMouseX, lastMouseY;
canvas.addEventListener('mousemove', (e) => {
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
});

function gameLoop() {
  Engine.update(engine, 1000 / 60);
  draw();
  requestAnimationFrame(gameLoop);
}

createGround();
gameLoop();
