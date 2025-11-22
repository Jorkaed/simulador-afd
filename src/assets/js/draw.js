// ==============================
//   DRAW.JS — Cytoscape Local
// ==============================

// Referencia a la librería cargada en index.html
const cytoscape = window.cytoscapeLib || window.cytoscape;

let cy = null;

// ==============================
// Inicializar grafo (Estilos)
// ==============================
function initGraph() {
    cy = cytoscape({
        container: document.getElementById("cy"),
        
        // Bloqueamos el zoom inicial para evitar problemas visuales
        minZoom: 0.5,
        maxZoom: 2,
        wheelSensitivity: 0.2,

        style: [
            // --- NODOS ---
            {
                selector: "node",
                style: {
                    "label": "data(label)",
                    "background-color": "#ffffff",
                    "border-color": "#000",
                    "border-width": 2,
                    "text-valign": "center",
                    "text-halign": "center",
                    "font-size": "16px",
                    "width": 45,
                    "height": 45,
                    "color": "#000"
                }
            },
            {
                selector: "node.final",
                style: {
                    "border-width": 5,
                    "border-style": "double"
                }
            },
            {
                selector: "node.current",
                style: {
                    "background-color": "#ffeb3b" // Amarillo
                }
            },
            
            // --- NODO FANTASMA (INVISIBLE) ---
            // Este nodo sirve de ancla para la flecha inicial
            {
                selector: "node.phantom",
                style: {
                    "visibility": "hidden",   // Ocultarlo completamente
                    "width": 1,
                    "height": 1,
                    "padding": 0,
                    "border-width": 0,
                    "events": "no"            // No interactuable
                }
            },

            // --- ARISTAS (TRANSICIONES) ---
            {
                selector: "edge",
                style: {
                    "curve-style": "bezier",
                    "target-arrow-shape": "triangle",
                    "target-arrow-color": "#000",
                    "line-color": "#666",
                    "width": 2,
                    "label": "data(label)",
                    "font-size": "14px",
                    "text-rotation": "autorotate",
                    "text-margin-y": -10,
                    "text-background-color": "#fff",
                    "text-background-opacity": 1,
                    "text-background-padding": 2
                }
            },
            
            // --- FLECHA INICIAL (-> q0) ---
            {
                selector: "edge.initial",
                style: {
                    "curve-style": "straight", // Flecha recta obligatoria
                    "line-color": "#000",
                    "target-arrow-color": "#000",
                    "target-arrow-shape": "triangle",
                    "width": 3,
                    "arrow-scale": 1.5,
                    "label": "" // Sin texto
                }
            }
        ]
    });
}

// Iniciar
initGraph();


// ==============================
// Refrescar grafo
// ==============================
function refrescarGrafo() {
    // 1. Limpiar todo
    cy.elements().remove();

    // 2. Agregar nodos (Estados)
    afd.estados.forEach(est => {
        cy.add({ group: "nodes", data: { id: est, label: est } });
    });

    // 3. Marcar finales
    afd.estadosFinales.forEach(est => {
        cy.getElementById(est).addClass("final");
    });

    // 4. Agregar aristas (Transiciones)
    afd.estados.forEach(o => {
        afd.alfabeto.forEach(sim => {
            const d = afd.transiciones[o][sim];
            if (d) {
                cy.add({
                    group: "edges",
                    data: {
                        id: `T_${o}_${sim}_${d}`,
                        source: o,
                        target: d,
                        label: sim
                    }
                });
            }
        });
    });

    // 5. Configurar Layout con callback 'stop'
    // Esto es CRUCIAL: La flecha inicial solo se dibuja cuando el layout TERMINA.
    const layoutConfig = {
        name: "circle",
        padding: 50,
        fit: true,
        animate: true, // Animación suave para ver cómo se acomodan
        animationDuration: 500,
        stop: function() {
            // Esta función se ejecuta cuando los nodos ya tienen su posición final (x, y)
            agregarFlechaInicial();
        }
    };

    cy.layout(layoutConfig).run();
}

// Función auxiliar para dibujar la flecha inicial
function agregarFlechaInicial() {
    // Limpiar flecha anterior si existiera (por seguridad)
    cy.remove("#phantom_start");
    cy.remove("#edge_start");

    if (afd.estadoInicial) {
        const nodoInicial = cy.getElementById(afd.estadoInicial);

        // Solo proceder si el nodo existe y tiene posición válida
        if (nodoInicial.length > 0 && nodoInicial.position().x !== undefined) {
            const pos = nodoInicial.position();

            // Crear nodo fantasma a la izquierda (-60px en X)
            // Desbloqueamos la posición para que cytoscape no se queje, pero no lo movemos
            cy.add({
                group: "nodes",
                data: { id: "phantom_start" },
                position: { x: pos.x - 80, y: pos.y }, 
                classes: "phantom"
            });

            // Conectar fantasma -> inicial
            cy.add({
                group: "edges",
                data: {
                    id: "edge_start",
                    source: "phantom_start",
                    target: afd.estadoInicial,
                    label: ""
                },
                classes: "initial"
            });
            
            // Forzar un repintado ligero sin mover nodos para mostrar la nueva arista
            cy.style().update();
        }
    }
}


// ==============================
// Animación de cadena
// ==============================
async function animarCadena(cadena) {
    const res = afd.procesarCadena(cadena);

    if (res.error) {
        alert(res.error);
        return;
    }

    let actual = afd.estadoInicial;
    
    // Reset visual
    cy.nodes().removeClass("current");
    
    // Marcar inicial
    if(actual) cy.getElementById(actual).addClass("current");

    for (let i = 0; i < cadena.length; i++) {
        const simbolo = cadena[i];
        await esperar(800); // Tiempo de espera entre pasos

        const destino = afd.transiciones[actual] ? afd.transiciones[actual][simbolo] : null;
        if (!destino) break;

        // Animación de transición
        cy.getElementById(actual).removeClass("current");
        
        // Resaltar la arista recorrida (opcional, mejora visual)
        const aristaId = `T_${actual}_${simbolo}_${destino}`;
        const arista = cy.getElementById(aristaId);
        arista.style('line-color', 'red');
        arista.style('target-arrow-color', 'red');
        arista.style('width', 4);

        await esperar(200); // Pequeña pausa en la transición

        // Restaurar arista
        arista.removeStyle(); 
        
        // Marcar nuevo estado
        cy.getElementById(destino).addClass("current");
        actual = destino;
    }

    await esperar(500);

    // Mostrar resultado en UI en lugar de alert (opcional, pero mejor UX)
    const divResultado = document.getElementById("resultado");
    if(divResultado) {
        divResultado.classList.remove("d-none");
        divResultado.className = res.resultado ? 
            "alert alert-success text-center fw-bold" : 
            "alert alert-danger text-center fw-bold";
        divResultado.textContent = res.resultado ? 
            `¡Cadena ACEPTADA! Estado final: ${res.estadoFinal}` : 
            `Cadena RECHAZADA. Estado final: ${res.estadoFinal}`;
    } else {
        alert(res.resultado ? "ACEPTADA" : "RECHAZADA");
    }
}

function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Hacer accesible para UI
window.refrescarGrafo = refrescarGrafo;
window.animarCadena = animarCadena;



