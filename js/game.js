const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");

    let player = { x: 100, y: 100, w: 40, h: 40, color: "blue" };
    let door = { x: 600, y: 250, w: 60, h: 100, color: "black" };
    let speed = 8;

    document.addEventListener("keydown", (e) => {
      if (e.key === "a") player.x -= speed;
      if (e.key === "d") player.x += speed;
      if (e.key === "w") player.y -= speed;
      if (e.key === "s") player.y += speed;

      // Detección de colisión
      if (
        player.x < door.x + door.w &&
        player.x + player.w > door.x &&
        player.y < door.y + door.h &&
        player.y + player.h > door.y
      ) {
        alert("Entraste en la puerta → Ir a Proyectos 🚀");
        window.location.href = "proyectos.html"; // Redirección
      }
    });

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dibujar jugador
      ctx.fillStyle = player.color;
      ctx.fillRect(player.x, player.y, player.w, player.h);

      // Dibujar puerta
      ctx.fillStyle = door.color;
      ctx.fillRect(door.x, door.y, door.w, door.h);

      requestAnimationFrame(draw);
    }

    draw();
