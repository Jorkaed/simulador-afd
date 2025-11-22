// ui.js — controlador UI
const afd = new AFD();

// DOM refs
const inputEstado = document.getElementById("input-estado");
const btnAddEstado = document.getElementById("btn-add-estado") || document.querySelector("#input-estado + button");
const btnDelEstado = document.getElementById("btn-del-estado");

const inputSimbolo = document.getElementById("input-simbolo");
const btnAddSimbolo = document.getElementById("btn-add-simbolo") || document.querySelector("#input-simbolo + button");
const btnDelSimbolo = document.getElementById("btn-del-simbolo");

const selectOrigen = document.getElementById("origen");
const selectSimbolo = document.getElementById("simbolo");
const selectDestino = document.getElementById("destino");
const btnAddTrans = document.getElementById("btn-add-trans");

// ✅ NUEVA REFERENCIA: Botón eliminar transiciones
const btnDelAllTrans = document.getElementById("btn-del-all-trans");

const tableHead = document.getElementById("thead-trans");
const tableBody = document.getElementById("tbody-trans");

const selectInicial = document.getElementById("estado-inicial");
const selectFinales = document.getElementById("estados-finales");

const inputCadena = document.getElementById("cadena");
const btnSimular = document.getElementById("btn-simular");
const divResultado = document.getElementById("resultado");

// Función para refrescar el grafo (si draw.js está cargado)
function dibujarSiEsPosible() {
  if (typeof refrescarGrafo === "function") {
    try { refrescarGrafo(); } catch (e) { console.error(e); }
  }
}

// Actualizar Selects
function actualizarSelects() {
  const estados = Array.from(afd.estados);
  const alfabeto = Array.from(afd.alfabeto);

  // Helpers
  const llenar = (sel, arr) => {
    if (!sel) return;
    sel.innerHTML = "";
    arr.forEach(v => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      sel.appendChild(opt);
    });
  };

  llenar(selectOrigen, estados);
  llenar(selectDestino, estados);
  llenar(selectSimbolo, alfabeto);
  llenar(selectInicial, estados);
  
  // Select múltiple de finales
  if (selectFinales) {
    selectFinales.innerHTML = "";
    estados.forEach(est => {
      const opt = document.createElement("option");
      opt.value = est;
      opt.textContent = est;
      if (afd.estadosFinales.has(est)) opt.selected = true;
      selectFinales.appendChild(opt);
    });
  }

  if (afd.estadoInicial && selectInicial) {
    selectInicial.value = afd.estadoInicial;
  }
}

// Actualizar Tabla
function actualizarTabla() {
  if (!tableHead || !tableBody) return;

  // Encabezado: Estado | Símbolo A | Símbolo B ...
  tableHead.innerHTML = "";
  const rowHead = document.createElement("tr");
  const thEst = document.createElement("th");
  thEst.textContent = "Estado";
  rowHead.appendChild(thEst);

  const simbolos = Array.from(afd.alfabeto);
  simbolos.forEach(sim => {
    const th = document.createElement("th");
    th.textContent = sim;
    rowHead.appendChild(th);
  });
  tableHead.appendChild(rowHead);

  // Cuerpo
  tableBody.innerHTML = "";
  afd.estados.forEach(estado => {
    const row = document.createElement("tr");
    const tdEst = document.createElement("td");
    
    // Marcar inicial/final visualmente en la tabla
    let label = estado;
    if (estado === afd.estadoInicial) label = "-> " + label;
    if (afd.estadosFinales.has(estado)) label = "*" + label;
    
    tdEst.textContent = label;
    tdEst.classList.add("fw-bold");
    row.appendChild(tdEst);

    simbolos.forEach(sim => {
      const td = document.createElement("td");
      const dest = afd.transiciones[estado][sim];
      td.textContent = dest ? dest : "-";
      
      // Permitir clic en celda para definir transición rápidamente (Opcional)
      td.style.cursor = "pointer";
      td.onclick = () => {
          selectOrigen.value = estado;
          selectSimbolo.value = sim;
          if(dest) selectDestino.value = dest;
      };
      
      row.appendChild(td);
    });
    tableBody.appendChild(row);
  });
}

function actualizarTodo() {
  actualizarSelects();
  actualizarTabla();
  dibujarSiEsPosible();
}

// Eventos
if (btnAddEstado) {
  btnAddEstado.addEventListener("click", () => {
    if (afd.agregarEstado(inputEstado.value)) {
      inputEstado.value = "";
      actualizarTodo();
    } else {
        alert("Nombre inválido o ya existe");
    }
  });
}

if (btnDelEstado) {
  btnDelEstado.addEventListener("click", () => {
    if (afd.eliminarEstado(inputEstado.value)) {
      inputEstado.value = "";
      actualizarTodo();
    }
  });
}

if (btnAddSimbolo) {
  btnAddSimbolo.addEventListener("click", () => {
    if (afd.agregarSimbolo(inputSimbolo.value)) {
      inputSimbolo.value = "";
      actualizarTodo();
    }
  });
}

if (btnDelSimbolo) {
  btnDelSimbolo.addEventListener("click", () => {
    if (afd.eliminarSimbolo(inputSimbolo.value)) {
      inputSimbolo.value = "";
      actualizarTodo();
    }
  });
}

if (btnAddTrans) {
  btnAddTrans.addEventListener("click", () => {
    const o = selectOrigen.value;
    const s = selectSimbolo.value;
    const d = selectDestino.value;
    if (afd.agregarTransicion(o, s, d)) {
      actualizarTodo();
    }
  });
}

// ✅ NUEVO LISTENER: Eliminar todas las transiciones
if (btnDelAllTrans) {
  btnDelAllTrans.addEventListener("click", () => {
    // Confirmación simple para evitar accidentes
    if (confirm("¿Estás seguro de que quieres eliminar TODAS las transiciones?")) {
      afd.eliminarTodasLasTransiciones();
      actualizarTodo();
    }
  });
}

if (selectInicial) {
  selectInicial.addEventListener("change", () => {
    afd.setEstadoInicial(selectInicial.value);
    actualizarTodo();
  });
}

if (selectFinales) {
  selectFinales.addEventListener("change", () => {
    afd.estadosFinales.clear();
    const opts = selectFinales.selectedOptions;
    for (let i = 0; i < opts.length; i++) {
      afd.agregarEstadoFinal(opts[i].value);
    }
    actualizarTodo();
  });
}

if (btnSimular) {
  btnSimular.addEventListener("click", () => {
    const cadena = inputCadena.value.trim();
    // Usar la animación si existe
    if (typeof window.animarCadena === "function") {
        window.animarCadena(cadena);
    } else {
        // Fallback texto
        const res = afd.procesarCadena(cadena);
        if(divResultado) {
            divResultado.classList.remove("d-none");
            divResultado.textContent = res.error ? res.error : (res.resultado ? "Aceptada" : "Rechazada");
            divResultado.className = res.resultado ? "alert alert-success" : "alert alert-danger";
        }
    }
  });
}

// Inicialización
actualizarTodo();


