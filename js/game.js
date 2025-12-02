const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// TAMAÑO PLAYER
let player = { x: 100, y: 100, w: 48, h: 48 };
let door = { x: 600, y: 250, w: 60, h: 100, color: "black" };
let speed = 5;

let keys = { left: false, right: false, up: false, down: false };

// SPRITES
const spriteFront = new Image();
spriteFront.src = "./assets/katarina/front-kata.png";

const spriteLeft = [new Image(), new Image()];
spriteLeft[0].src = "./assets/katarina/left1-kata.png";
spriteLeft[1].src = "./assets/katarina/left2-kata.png";

const spriteRight = [new Image(), new Image()];
spriteRight[0].src = "./assets/katarina/right1-kata.png";
spriteRight[1].src = "./assets/katarina/right2-kata.png";

let frameIndex = 0;
let frameTick = 0;
let currentSprite = spriteFront;

// ==========================================================
//     CANVAS RESPONSIVE REAL
// ==========================================================
function resizeCanvasToDisplaySize() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}

// ==========================================================
//     MOVIMIENTO
// ==========================================================
function movePlayer() {
  let moving = false;

  if (keys.left) {
    player.x -= speed;
    currentSprite = spriteLeft[frameIndex];
    moving = true;
  }
  if (keys.right) {
    player.x += speed;
    currentSprite = spriteRight[frameIndex];
    moving = true;
  }
  if (keys.up) {
    player.y -= speed;
    moving = true;
  }
  if (keys.down) {
    player.y += speed;
    moving = true;
  }

  // BORDERS
  if (player.x < 0) player.x = 0;
  if (player.y < 0) player.y = 0;
  if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;
  if (player.y + player.h > canvas.height) player.y = canvas.height - player.h;

  // PUERTA (COLISIÓN)
  if (
    player.x < door.x + door.w &&
    player.x + player.w > door.x &&
    player.y < door.y + door.h &&
    player.y + player.h > door.y
  ) {
    alert("Entraste en la puerta → Ir a Proyectos 🚀");
    window.location.href = "projects.html";
  }

  // ANIMACIÓN
  if (moving) {
    frameTick++;
    if (frameTick > 10) {
      frameIndex = (frameIndex + 1) % 2;
      frameTick = 0;
    }
  } else {
    currentSprite = spriteFront;
  }
}

// ==========================================================
//     TECLADO
// ==========================================================
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

// ==========================================================
//     BOTONES TÁCTILES
// ==========================================================
function setupTouchControl(btnId, dir) {
  const btn = document.getElementById(btnId);
  if (!btn) return;

  btn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    keys[dir] = true;
  });

  btn.addEventListener("touchend", () => {
    keys[dir] = false;
  });

  btn.addEventListener("mousedown", () => {
    keys[dir] = true;
  });

  btn.addEventListener("mouseup", () => {
    keys[dir] = false;
  });

  btn.addEventListener("mouseleave", () => {
    keys[dir] = false;
  });
}

setupTouchControl("up", "up");
setupTouchControl("down", "down");
setupTouchControl("left", "left");
setupTouchControl("right", "right");

// ==========================================================
//     LOOP PRINCIPAL DEL JUEGO
// ==========================================================
function draw() {
  resizeCanvasToDisplaySize(); // <-- RESPONSIVE REAL

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  movePlayer();

  // Player
  ctx.drawImage(currentSprite, player.x, player.y, player.w, player.h);

  // Door
  ctx.fillStyle = door.color;
  ctx.fillRect(door.x, door.y, door.w, door.h);

  requestAnimationFrame(draw);
}

draw();
