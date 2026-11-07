// src/js/validaciones.js — Validación interactiva, mensajes en español y control de pantalla de carga

document.addEventListener("DOMContentLoaded", () => {
	const form = document.getElementById("EncuestaForm");
	const loadingOverlay = document.getElementById("loadingOverlay");

	if (!form) return;

	// * Traducir y personalizar los mensajes de error nativos del navegador al español
	const elements = form.querySelectorAll("input, select, textarea");
	elements.forEach((element) => {
		element.addEventListener("invalid", () => {
			if (element.validity.valueMissing) {
				element.setCustomValidity(
					"Este campo es obligatorio. Por favor, completa o selecciona una opción.",
				);
			} else if (element.validity.rangeOverflow) {
				element.setCustomValidity(
					`El valor ingresado es demasiado alto (Máximo permitido: ${element.max}).`,
				);
			} else if (element.validity.rangeUnderflow) {
				element.setCustomValidity(
					`El valor ingresado es demasiado bajo (Mínimo permitido: ${element.min}).`,
				);
			} else {
				element.setCustomValidity(
					"Por favor, introduce un valor válido para continuar.",
				);
			}
		});

		// * Limpiar el mensaje de error personalizado en cuanto el usuario interactúe
		element.addEventListener("input", () => {
			element.setCustomValidity("");
		});
		element.addEventListener("change", () => {
			element.setCustomValidity("");
		});
	});

	// * Control de envío del formulario hacia la API en la nube
	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		const gpaInput = document.getElementById("gpa");
		const gpaValue = parseFloat(gpaInput.value);

		// ! Validación estricta del GPA (Índice académico UTP: 0.00 a 3.00)
		if (Number.isNaN(gpaValue) || gpaValue < 0 || gpaValue > 3.0) {
			alert(
				"Error de validación: El índice académico (GPA) debe ser un valor numérico válido entre 0 y 3.00.",
			);
			gpaInput.focus();
			return;
		}

		// ? Recopilar datos del formulario
		const formData = new FormData(form);
		const data = {};

		formData.forEach((value, key) => {
			if (
				[
					"gpa",
					"cant_ides",
					"frecuenciaGit",
					"numRepositorio",
					"escalaOptima",
					"influenciaCali",
				].includes(key)
			) {
				data[key] = Number(value);
			} else {
				data[key] = value;
			}
		});

		// 🚀 Mostrar la pantalla de carga para evitar clics múltiples y dar feedback al usuario
		if (loadingOverlay) {
			loadingOverlay.style.display = "flex";
		}

		try {
			// * Enviar petición POST a la API de FastAPI en Render
			const response = await fetch(
				"https://proyecto-estadistica-mabk.onrender.com/api/respuestas",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(data),
				},
			);

			if (!response.ok) {
				throw new Error("Error al conectar con el servidor backend.");
			}

			const resultado = await response.json();
			console.log("✅ Datos guardados en la base de datos:", resultado);

			alert("✨ ¡Respuesta registrada y almacenada en SQLite con éxito!");
			form.reset();
		} catch (error) {
			// ! Capturar fallos de comunicación con el servidor en Render
			console.error("❌ Error de conexión:", error);
			alert(
				"⚠️ No se pudo conectar con el servidor backend en la nube. Inténtalo de nuevo en unos segundos.",
			);
		} finally {
			// 🛑 Ocultar la pantalla de carga sin importar si hubo éxito o error
			if (loadingOverlay) {
				loadingOverlay.style.display = "none";
			}
		}
	});
});
