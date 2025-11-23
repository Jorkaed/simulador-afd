# 📜 CHANGELOG

Todos los cambios importantes en este proyecto serán documentados en este archivo.

El formato sigue las recomendaciones de **Keep a Changelog** y el versionado sigue **Semantic Versioning**.

---

## [1.0.0] - 2025-11-21

### 🚀 Lanzamiento inicial (versión estable)

* Interfaz gráfica completa del simulador AFD.
* Gestión del alfabeto: agregar/eliminar símbolos.
* Gestión de estados: agregar/eliminar estados.
* Asignación del estado inicial.
* Marcación de múltiples estados finales.
* Tabla de transiciones dinámica.
* Visualización de autómatas con **Cytoscape.js (local)**.
* Animación paso a paso al simular cadenas:

  * Iluminación del estado actual.
  * Seguimiento de cada transición.
* Flecha estilizada de estado inicial compatible con diagramas típicos de AFD.
* Borrado masivo de transiciones.
* Estructura modular:

  * `afd.js` – Lógica interna del AFD.
  * `ui.js` – Interacción DOM.
  * `draw.js` – Render del grafo con Cytoscape.
  * `main.js` y `preload.js` – Estructura Electron.
* Sistema de empaquetado con **electron-builder**.
* Compatibilidad con Windows, Linux y macOS.

---

## [0.2.0] - 2025-11-20

### ✨ Mejoras

* Integración parcial con Cytoscape.js desde CDN.
* Primer prototipo estable de grafo visual.
* Implementación preliminar de animación de cadenas.

### 🐞 Correcciones

* Ajustes en la tabla de transiciones que no actualizaba correctamente.
* Corrección de errores al eliminar estados y transiciones huérfanas.

---

## [0.1.0] - 2025-11-18

### 🧪 Prototipo inicial

* Construcción del AFD mediante estructuras de JavaScript.
* Interfaz HTML básica sin estilos.
* Inclusión de lógica para procesar cadenas.
* Implementación de la estructura del proyecto.

---