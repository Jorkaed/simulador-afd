// afd.js
class AFD {
  constructor() {
    this.estados = new Set();
    this.alfabeto = new Set();
    this.transiciones = {}; // { q0: {a: q1} }
    this.estadoInicial = null;
    this.estadosFinales = new Set();
  }

  agregarEstado(nombre) {
    if (!nombre) return false;
    nombre = nombre.trim();
    if (nombre === "") return false;
    if (this.estados.has(nombre)) return true;

    this.estados.add(nombre);
    this.transiciones[nombre] = {};
    this.alfabeto.forEach(sim => {
      this.transiciones[nombre][sim] = null;
    });
    return true;
  }

  eliminarEstado(nombre) {
    if (!this.estados.has(nombre)) return false;

    this.estados.delete(nombre);
    delete this.transiciones[nombre];

    // Limpiar referencias hacia este estado
    for (let e of Object.keys(this.transiciones)) {
      for (let s of Object.keys(this.transiciones[e] || {})) {
        if (this.transiciones[e][s] === nombre) {
          this.transiciones[e][s] = null;
        }
      }
    }

    if (this.estadoInicial === nombre) this.estadoInicial = null;
    this.estadosFinales.delete(nombre);
    return true;
  }

  agregarSimbolo(simbolo) {
    if (!simbolo || simbolo.length !== 1) return false;
    if (this.alfabeto.has(simbolo)) return true;

    this.alfabeto.add(simbolo);
    this.estados.forEach(estado => {
      if (!this.transiciones[estado]) this.transiciones[estado] = {};
      this.transiciones[estado][simbolo] = null;
    });
    return true;
  }

  eliminarSimbolo(simbolo) {
    if (!this.alfabeto.has(simbolo)) return false;
    this.alfabeto.delete(simbolo);
    this.estados.forEach(estado => {
      if (this.transiciones[estado]) {
        delete this.transiciones[estado][simbolo];
      }
    });
    return true;
  }

  agregarTransicion(origen, simbolo, destino) {
    if (!this.estados.has(origen) || !this.estados.has(destino)) return false;
    if (!this.alfabeto.has(simbolo)) return false;
    
    this.transiciones[origen][simbolo] = destino;
    return true;
  }

  eliminarTodasLasTransiciones() {
    this.estados.forEach(estado => {
      this.alfabeto.forEach(simbolo => {
        if (this.transiciones[estado]) {
          this.transiciones[estado][simbolo] = null;
        }
      });
    });
  }

  setEstadoInicial(estado) {
    if (this.estados.has(estado)) {
      this.estadoInicial = estado;
    }
  }

  agregarEstadoFinal(estado) {
    if (this.estados.has(estado)) {
      this.estadosFinales.add(estado);
    }
  }

  eliminarEstadoFinal(est) {
    this.estadosFinales.delete(est);
  }

  procesarCadena(cadena) {
    if (!this.estadoInicial) {
      return {
        resultado: false,
        error: "No se ha definido estado inicial",
        rastroEstados: [],
        estadoFinal: null
      };
    }

    let actual = this.estadoInicial;
    const rastro = [actual];

    for (let i = 0; i < cadena.length; i++) {
      const simbolo = cadena[i];

      if (!this.alfabeto.has(simbolo)) {
        return {
          resultado: false,
          error: `Símbolo '${simbolo}' no pertenece al alfabeto`,
          rastroEstados: rastro,
          estadoFinal: actual
        };
      }

      const transDesdeActual = this.transiciones[actual];
      if (!transDesdeActual) {
        return {
          resultado: false,
          error: `Sin transiciones definidas para el estado ${actual}`,
          rastroEstados: rastro,
          estadoFinal: actual
        };
      }

      const destino = transDesdeActual[simbolo];
      if (!destino) {
        return {
          resultado: false,
          error: `No existe transición desde ${actual} con '${simbolo}'`,
          rastroEstados: rastro,
          estadoFinal: actual
        };
      }

      actual = destino;
      rastro.push(actual);
    }

    const esAceptado = this.estadosFinales.has(actual);
    return {
      resultado: esAceptado,
      error: null,
      rastroEstados: rastro,
      estadoFinal: actual
    };
  }
}

window.AFD = AFD;

