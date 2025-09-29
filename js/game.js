const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let player = { x: 100, y: 100, w: 40, h: 40, color: "blue" };
let door = { x: 600, y: 250, w: 60, h: 100, color: "black" };
let speed = 6;

// Direcciones activas
let keys = {
  left: false,
  right: false,
  up: false,
  down: false,
};

// ---------------------------
// FUNCIONES
// ---------------------------
function movePlayer() {
  if (keys.left) player.x -= speed;
  if (keys.right) player.x += speed;
  if (keys.up) player.y -= speed;
  if (keys.down) player.y += speed;

  // Limitar bordes
  if (player.x < 0) player.x = 0;
  if (player.y < 0) player.y = 0;
  if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;
  if (player.y + player.h > canvas.height) player.y = canvas.height - player.h;

  // Colisión con puerta
  if (
    player.x < door.x + door.w &&
    player.x + player.w > door.x &&
    player.y < door.y + door.h &&
    player.y + player.h > door.y
  ) {
    alert("Entraste en la puerta → Ir a Proyectos 🚀");
    window.location.href = "projects.html";
  }
}

// ---------------------------
// CONTROLES TECLADO
// ---------------------------
document.addEventListener("keydown", (e) => {
  if (e.key === "a") keys.left = true;
  if (e.key === "d") keys.right = true;
  if (e.key === "w") keys.up = true;
  if (e.key === "s") keys.down = true;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "a") keys.left = false;
  if (e.key === "d") keys.right = false;
  if (e.key === "w") keys.up = false;
  if (e.key === "s") keys.down = false;
});

// ---------------------------
// CONTROLES TÁCTILES
// ---------------------------
function setupTouchControl(btnId, dir) {
  const btn = document.getElementById(btnId);
  if (!btn) return;

  // Al presionar
  btn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    keys[dir] = true;
  });

  btn.addEventListener("mousedown", (e) => {
    e.preventDefault();
    keys[dir] = true;
  });

  // Al soltar
  btn.addEventListener("touchend", () => {
    keys[dir] = false;
  });

  btn.addEventListener("mouseup", () => {
    keys[dir] = false;
  });

  // Si el dedo/mouse sale del botón
  btn.addEventListener("mouseleave", () => {
    keys[dir] = false;
  });
}

setupTouchControl("up", "up");
setupTouchControl("down", "down");
setupTouchControl("left", "left");
setupTouchControl("right", "right");

// ---------------------------
// DIBUJAR JUEGO
// ---------------------------
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  movePlayer();

  // Dibujar jugador
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // Dibujar puerta
  ctx.fillStyle = door.color;
  ctx.fillRect(door.x, door.y, door.w, door.h);

  requestAnimationFrame(draw);
}

draw();

