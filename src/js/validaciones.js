// src/js/validaciones.js — Validación interactiva, mensajes en español y captura de datos

document.addEventListener("DOMContentLoaded", () => {
	const form = document.getElementById("EncuestaForm");

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

	// * Control de envío del formulario hacia la API
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

		// ? Recopilar datos para simulación de análisis estadístico
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

		try {
			// * Enviar petición POST a la API de FastAPI (SQLite)
			const response = await fetch("http://192.168.1.217:8000/api/respuestas", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error("Error al conectar con el servidor backend.");
			}

			const resultado = await response.json();
			console.log("✅ Datos guardados en la base de datos:", resultado);

			alert("✨ ¡Respuesta registrada y almacenada en SQLite con éxito!");
			form.reset();
		} catch (error) {
			// ! Capturar fallos de comunicación con el servidor Uvicorn
			console.error("❌ Error de conexión:", error);
			alert(
				"⚠️ No se pudo conectar con el servidor backend de Python. Asegúrate de ejecutar uvicorn.",
			);
		}
	});
});
