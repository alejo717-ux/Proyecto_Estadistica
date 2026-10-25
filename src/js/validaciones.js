// src/js/validaciones.js — Validación interactiva, mensajes en español y captura de datos

document.addEventListener("DOMContentLoaded", () => {
	const form = document.getElementById("EncuestaForm");

	if (!form) return;

	// Traducir y personalizar los mensajes de error nativos del navegador al español
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

		// Limpiar el mensaje de error personalizado en cuanto el usuario interactúe
		element.addEventListener("input", () => {
			element.setCustomValidity("");
		});
		element.addEventListener("change", () => {
			element.setCustomValidity("");
		});
	});

	// Control de envío del formulario
	form.addEventListener("submit", (e) => {
		e.preventDefault();

		const gpaInput = document.getElementById("gpa");
		const gpaValue = parseFloat(gpaInput.value);

		// Validación estricta del GPA (Índice académico UTP: 0.00 a 3.00)
		if (Number.isNaN(gpaValue) || gpaValue < 0 || gpaValue > 3.0) {
			alert(
				"Error de validación: El índice académico (GPA) debe ser un valor numérico válido entre 0 y 3.00.",
			);
			gpaInput.focus();
			return;
		}

		// Recopilar datos para simulación de análisis estadístico
		const formData = new FormData(form);
		const respuestaEstudiante = {};

		for (let [key, value] of formData.entries()) {
			respuestaEstudiante[key] = value;
		}

		console.log(
			"📊 Datos de encuesta capturados exitosamente:",
			respuestaEstudiante,
		);

		// Alerta de éxito integrada con la estética
		alert(
			"✨ ¡Respuesta registrada con éxito! Los datos han sido integrados al buffer estadístico.",
		);

		form.reset();
	});
});
