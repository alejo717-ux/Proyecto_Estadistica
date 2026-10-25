// src/js/scripts.js — Fondo Animado de 8-bits (Estadística y Probabilidad)

const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Clase para crear Invaders/Naves en forma de Histograma y Dados de Probabilidad
class RetroDataSprite {
	constructor() {
		this.reset();
	}

	reset() {
		this.x = Math.random() * canvas.width;
		this.y = Math.random() * canvas.height;
		this.speedX = (Math.random() - 0.5) * 1.2;
		this.speedY = (Math.random() - 0.5) * 0.8;
		this.type = Math.floor(Math.random() * 3); // 0: Dado 8-bit, 1: Nave Gauss, 2: Moneda Bernoulli
		this.size = 24;
		this.alpha = 0.25 + Math.random() * 0.25; // Opacidad sutil para no fatigar la vista
		this.frame = 0;
	}

	update() {
		this.x += this.speedX;
		this.y += this.speedY;
		this.frame += 0.05;

		// Rebotes en los bordes de la pantalla
		if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
		if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
	}

	draw() {
		ctx.save();
		ctx.globalAlpha = this.alpha;
		ctx.fillStyle = "#00ff66";

		if (this.type === 0) {
			// DADO PROBABILÍSTICO (8-bits)
			ctx.strokeStyle = "#00ff66";
			ctx.lineWidth = 2;
			ctx.strokeRect(this.x, this.y, this.size, this.size);

			// Puntos del dado estilo pixel
			ctx.fillRect(this.x + 5, this.y + 5, 4, 4);
			ctx.fillRect(this.x + 15, this.y + 15, 4, 4);
			ctx.fillRect(this.x + 10, this.y + 10, 4, 4);
		} else if (this.type === 1) {
			// NAVE HISTOGRAMA / CAMPANA DE GAUSS 8-BIT
			const p = 4; // Tamaño de pixel
			// Matriz pixel art de una Nave Campana
			const pixelMap = [
				[0, 0, 1, 1, 0, 0],
				[0, 1, 1, 1, 1, 0],
				[1, 1, 1, 1, 1, 1],
				[1, 0, 1, 1, 0, 1],
			];

			for (let r = 0; r < pixelMap.length; r++) {
				for (let c = 0; c < pixelMap[r].length; c++) {
					if (pixelMap[r][c] === 1) {
						ctx.fillRect(this.x + c * p, this.y + r * p, p, p);
					}
				}
			}
		} else {
			// MONEDA DE BERNOULLI (1 / 0)
			ctx.font = '20px "VT323", monospace';
			const val = Math.floor(this.frame) % 2 === 0 ? "P(1)" : "P(0)";
			ctx.fillText(val, this.x, this.y);
		}

		ctx.restore();
	}
}

// Generar enjambre de sprites estadísticos
const sprites = [];
const cantSprites = 25; // Cantidad moderada para evitar saturación visual

for (let i = 0; i < cantSprites; i++) {
	sprites.push(new RetroDataSprite());
}

// Bucle principal de animación
function animate() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	sprites.forEach((sprite) => {
		sprite.update();
		sprite.draw();
	});

	requestAnimationFrame(animate);
}

animate();
