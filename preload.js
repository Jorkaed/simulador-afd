// ================================
// PRELOAD — Exposure segura
// ================================
const { contextBridge, ipcRenderer } = require("electron");

// ELIMINAR ESTO: const cytoscape = require("cytoscape");
// ELIMINAR ESTO: contextBridge.exposeInMainWorld("cytoscapeLib", cytoscape);

// Exponer métodos permitidos para comunicación
contextBridge.exposeInMainWorld("electronAPI", {
    invoke: (channel, ...args) => {
        const allowed = ["fs-read-file"];
        if (allowed.includes(channel)) {
            return ipcRenderer.invoke(channel, ...args);
        }
        return Promise.reject("Canal bloqueado");
    },

    send: (channel, data) => {
        const allowed = ["toMain"];
        if (allowed.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },

    on: (channel, callback) => {
        const allowed = ["fromMain"];
        if (allowed.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => callback(...args));
        }
    }
});



