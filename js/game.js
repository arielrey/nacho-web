// ==========================================================
// Mini-RPG Portfolio - Cámara + Mundo grande + Triggers
// ==========================================================

// Canvas & contexto
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ----- RESOLUCIÓN VIRTUAL (mundo lógico)
const VIRTUAL_WIDTH = 1000;
const VIRTUAL_HEIGHT = 800;

// ----- MAPA (mundo real)
const MAP_WIDTH = 3000;
const MAP_HEIGHT = 2000;

// Ajusta el tamaño visual del canvas manteniendo la resolución interna
function resizeCanvas() {
  // proporción virtual
  const ratio = VIRTUAL_WIDTH / VIRTUAL_HEIGHT;
  // ancho real visual permitido por CSS (clientWidth)
  const displayWidth = canvas.clientWidth;
  const displayHeight = displayWidth / ratio;

  // resolución interna del canvas — NO cambiar (mantiene la lógica)
  canvas.width = VIRTUAL_WIDTH;
  canvas.height = VIRTUAL_HEIGHT;

  // estilo visual (alto en px, para mostrarlo responsive)
  canvas.style.height = displayHeight + "px";
}

// se llama al inicio y en resize
window.addEventListener("resize", resizeCanvas);
resizeCanvas();


// ==========================================================
// PLAYER (posiciones en coordenadas del mundo)
// ==========================================================
let player = {
  x: 150,               // world x
  y: 150,               // world y
  w: 48,
  h: 48,
  speed: 4
};

// Sprites (usa tus rutas, si faltan se dibuja un rect)
const spriteFront = new Image();
spriteFront.src = "./assets/katarina/front-kata.png";

const spriteLeft = [new Image(), new Image()];
spriteLeft[0].src = "./assets/katarina/left1-kata.png";
spriteLeft[1].src = "./assets/katarina/left2-kata.png";

const spriteRight = [new Image(), new Image()];
spriteRight[0].src = "./assets/katarina/right1-kata.png";
spriteRight[1].src = "./assets/katarina/right2-kata.png";

let currentSprite = spriteFront;
let frameIndex = 0;
let frameTick = 0;

// ==========================================================
// CÁMARA
// ==========================================================
const camera = { x: 0, y: 0, w: VIRTUAL_WIDTH, h: VIRTUAL_HEIGHT };

function updateCamera() {
  // Queremos que el jugador aparezca centrado en pantalla (en coordenadas virtuales)
  camera.x = player.x - VIRTUAL_WIDTH / 2 + player.w / 2;
  camera.y = player.y - VIRTUAL_HEIGHT / 2 + player.h / 2;

  // Limitar cámara dentro del mapa
  camera.x = Math.max(0, Math.min(camera.x, MAP_WIDTH - camera.w));
  camera.y = Math.max(0, Math.min(camera.y, MAP_HEIGHT - camera.h));
}

// ==========================================================
// MUNDO: fondo (imagen grande opcional) + objetos
// ==========================================================
const mapImage = new Image();
mapImage.src = "../assets/backgrounds/map_large.png"; // si no existe, se dibuja un fallback

// Objetos del mundo (puertas, NPCs, elementos). Coordenadas en world space.
const worldObjects = [
  {
    id: "door_projects",
    type: "door",
    x: 2400,
    y: 400,
    w: 80,
    h: 140,
    color: "#111111",
    target: "projects.html",
    label: "Projects"
  },
  {
    id: "bench",
    type: "decoration",
    x: 1200,
    y: 900,
    w: 120,
    h: 40,
    color: "#6b4f2a"
  }
];

// Muros / colisiones (rects en coordenadas del mundo)
const walls = [
  // límites del mapa (opcional, ya los controlamos con clamp)
  // ejemplos de muros internos:
  { x: 800, y: 200, w: 40, h: 500 },   // pared vertical
  { x: 1400, y: 600, w: 600, h: 40 },  // pared horizontal
  { x: 2000, y: 1000, w: 40, h: 800 }  // otra pared
];

// ----------------------------------------------------------
// UTIL: detección AABB
function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

// ==========================================================
// CONTROLES
// ==========================================================
let keys = { left: false, right: false, up: false, down: false };

document.addEventListener("keydown", (e) => {
  if (e.key === "a" || e.key === "ArrowLeft") keys.left = true;
  if (e.key === "d" || e.key === "ArrowRight") keys.right = true;
  if (e.key === "w" || e.key === "ArrowUp") keys.up = true;
  if (e.key === "s" || e.key === "ArrowDown") keys.down = true;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "a" || e.key === "ArrowLeft") keys.left = false;
  if (e.key === "d" || e.key === "ArrowRight") keys.right = false;
  if (e.key === "w" || e.key === "ArrowUp") keys.up = false;
  if (e.key === "s" || e.key === "ArrowDown") keys.down = false;
});

// Touch / botón (móvil)
function setupTouchControl(btnId, dir) {
  const btn = document.getElementById(btnId);
  if (!btn) return;

  btn.addEventListener("touchstart", (e) => { e.preventDefault(); keys[dir] = true; });
  btn.addEventListener("touchend", () => { keys[dir] = false; });

  btn.addEventListener("mousedown", () => { keys[dir] = true; });
  btn.addEventListener("mouseup", () => { keys[dir] = false; });
  btn.addEventListener("mouseleave", () => { keys[dir] = false; });
}

setupTouchControl("up", "up");
setupTouchControl("down", "down");
setupTouchControl("left", "left");
setupTouchControl("right", "right");

// ==========================================================
// MOVIMIENTO con colisiones simples (AABB)
// ==========================================================
function movePlayer() {
  let dx = 0;
  let dy = 0;
  if (keys.left)  dx -= player.speed;
  if (keys.right) dx += player.speed;
  if (keys.up)    dy -= player.speed;
  if (keys.down)  dy += player.speed;

  // Animación de sprites
  if (dx !== 0 || dy !== 0) {
    frameTick++;
    if (frameTick > 8) {
      frameIndex = (frameIndex + 1) % 2;
      frameTick = 0;
    }
    // dirección sprite simple
    if (dx < 0) currentSprite = spriteLeft[frameIndex];
    else if (dx > 0) currentSprite = spriteRight[frameIndex];
  } else {
    currentSprite = spriteFront;
  }

  // propuesta de nueva posición (en world coords)
  const newPos = { x: player.x + dx, y: player.y + dy, w: player.w, h: player.h };

  // Limitar dentro de los bordes del mapa
  newPos.x = Math.max(0, Math.min(newPos.x, MAP_WIDTH - player.w));
  newPos.y = Math.max(0, Math.min(newPos.y, MAP_HEIGHT - player.h));

  // Chequear colisión contra cada muro
  let collided = false;
  for (let wall of walls) {
    if (rectsOverlap(newPos, wall)) {
      collided = true;
      break;
    }
  }

  // Si no colisiona, aplicamos movimiento
  if (!collided) {
    player.x = newPos.x;
    player.y = newPos.y;
  } else {
    // intento de permitir movimiento en un solo eje (suaviza los choques)
    const tryX = { x: player.x + dx, y: player.y, w: player.w, h: player.h };
    const tryY = { x: player.x, y: player.y + dy, w: player.w, h: player.h };
    let collideX = walls.some(wall => rectsOverlap(tryX, wall));
    let collideY = walls.some(wall => rectsOverlap(tryY, wall));
    if (!collideX) player.x = tryX.x;
    if (!collideY) player.y = tryY.y;
  }

  // Trigger / interacción con objetos (puertas)
  for (let obj of worldObjects) {
    if (obj.type === "door") {
      const playerRect = { x: player.x, y: player.y, w: player.w, h: player.h };
      const doorRect = { x: obj.x, y: obj.y, w: obj.w, h: obj.h };
      if (rectsOverlap(playerRect, doorRect)) {
        // pequeña confirmación visual / prevent spam
        // navegamos a la target (puede ser un html local)
        window.location.href = obj.target;
      }
    }
  }
}

// ==========================================================
// DRAW (todo se dibuja en coordinates = world - camera)
// ==========================================================
function clearScreen() {
  ctx.fillStyle = "#121212";
  ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
}

function drawMap() {
  // si la imagen del mapa está disponible, dibujar porciones según la cámara
  if (mapImage.complete && mapImage.naturalWidth !== 0) {
    // calculamos la subimagen del mapa a dibujar (source coords sobre la imagen grande).
    // Suponemos que mapImage tiene el tamaño MAP_WIDTH x MAP_HEIGHT OR se estira proporcionalmente.
    // Para simplicidad usaremos drawImage estirando la imagen grande al tamaño del mapa.
    ctx.drawImage(
      mapImage,
      0, 0, mapImage.width, mapImage.height,
      -camera.x, -camera.y, MAP_WIDTH, MAP_HEIGHT
    );
  } else {
    // fallback: grid / color block
    ctx.fillStyle = "#1e3a2b";
    ctx.fillRect(-camera.x, -camera.y, MAP_WIDTH, MAP_HEIGHT);

    // simple grid to give depth
    ctx.strokeStyle = "rgba(255,255,255,0.02)";
    ctx.lineWidth = 1;
    const grid = 100;
    for (let gx = 0; gx < MAP_WIDTH; gx += grid) {
      ctx.beginPath();
      ctx.moveTo(gx - camera.x, -camera.y);
      ctx.lineTo(gx - camera.x, MAP_HEIGHT - camera.y);
      ctx.stroke();
    }
    for (let gy = 0; gy < MAP_HEIGHT; gy += grid) {
      ctx.beginPath();
      ctx.moveTo(-camera.x, gy - camera.y);
      ctx.lineTo(MAP_WIDTH - camera.x, gy - camera.y);
      ctx.stroke();
    }
  }
}

function drawWorldObjects() {
  for (let obj of worldObjects) {
    const sx = obj.x - camera.x;
    const sy = obj.y - camera.y;

    if (obj.type === "door") {
      // puerta: dibujamos marco y label
      ctx.fillStyle = obj.color || "#000";
      ctx.fillRect(sx, sy, obj.w, obj.h);

      // puerta interior (simple)
      ctx.fillStyle = "#f2e205";
      ctx.fillRect(sx + 12, sy + 20, obj.w - 24, obj.h - 40);

      // etiqueta
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "18px Inter, sans-serif";
      ctx.fillText(obj.label || "Door", sx, sy - 8);
    } else {
      // decoraciones
      ctx.fillStyle = obj.color || "#888";
      ctx.fillRect(sx, sy, obj.w, obj.h);
    }
  }
}

function drawWalls() {
  ctx.fillStyle = "rgba(20,20,20,0.95)";
  for (let w of walls) {
    ctx.fillRect(w.x - camera.x, w.y - camera.y, w.w, w.h);
  }
}

function drawPlayerCentered() {
  // player se muestra siempre centrado en VIRTUAL coordinates (salvo casos donde la cámara está en los bordes;
  // si la cámara está en el borde, el jugador no estará exactamente en el centro visual)
  const screenX = player.x - camera.x; // si camera.x está limitado, screenX cambia
  const screenY = player.y - camera.y;

  // Si la cámara está centrada en el jugador normalmente screenX ~ VIRTUAL_WIDTH/2 - player.w/2
  // Pero este método es correcto: dibujamos player según su posición relativa a la cámara.
  if (currentSprite.complete && currentSprite.naturalWidth !== 0) {
    ctx.drawImage(currentSprite, screenX, screenY, player.w, player.h);
  } else {
    ctx.fillStyle = "#ffdd57";
    ctx.fillRect(screenX, screenY, player.w, player.h);
  }
}

function drawHUD() {
  // Miniinfo: coordenadas del jugador (opcional)
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(10, 10, 220, 36);
  ctx.fillStyle = "#fff";
  ctx.font = "14px Inter, sans-serif";
  ctx.fillText(`Player: ${Math.round(player.x)}, ${Math.round(player.y)}`, 16, 34);
}

// ==========================================================
// LOOP PRINCIPAL
// ==========================================================
function draw() {
  resizeCanvas();         // asegurar la visual correcta (solo ajusta style height)
  updateCamera();         // centrar cámara en jugador
  clearScreen();

  // Dibujar mundo (offset por -camera)
  drawMap();
  drawWorldObjects();
  drawWalls();

  // Dibujar player (relativo a cámara)
  drawPlayerCentered();

  // HUD
  drawHUD();

  requestAnimationFrame(loop);
}

// usamos un loop separado para lógica para que movePlayer corra a la misma velocidad que los frames
function loop() {
  movePlayer();
  draw();
}

// iniciar el loop
requestAnimationFrame(loop);
