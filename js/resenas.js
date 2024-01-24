class AlmacenReseñas {
  constructor() {
      this.taula = document.getElementById('historialReseñas');
      this.dbName = 'ReseñasDB';
      this.dbVersion = 1;
      this.objectStoreName = 'reseñas';
      this.db = null;
      this.init();
  }

  init() {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = (event) => {
          console.error("Error al abrir la base de datos:", event.target.errorCode);
      };

      request.onupgradeneeded = (event) => {
          const db = event.target.result;
          const objectStore = db.createObjectStore(this.objectStoreName, { keyPath: 'id', autoIncrement: true });
          objectStore.createIndex('nombre', 'nombre', { unique: false });
          objectStore.createIndex('calificacion', 'calificacion', { unique: false });
          objectStore.createIndex('fecha', 'fecha', { unique: false });
      };

      request.onsuccess = (event) => {
          this.db = event.target.result;
          this.mostrarReseñas();
      };
  }

  guardarReseña() {
      const nombreUsuario = document.getElementById('reseñaNombre').value;
      const nuevaReseña = document.getElementById('reseñaTexto').value;
      const calificacion = document.getElementById('calificacion').value;
      const fecha = new Date().toLocaleString();

      const transaction = this.db.transaction([this.objectStoreName], 'readwrite');
      const objectStore = transaction.objectStore(this.objectStoreName);
      const reseña = { nombre: nombreUsuario, texto: nuevaReseña, calificacion: calificacion, fecha: fecha };

      const request = objectStore.add(reseña);

      request.onsuccess = () => {
          console.log('Reseña añadida con éxito');
          this.mostrarReseñas();
          this.mostrarReseñaConClase(reseña);
      };

      request.onerror = (event) => {
          console.error('Error al añadir la reseña:', event.target.errorCode);
      };
  }

  mostrarReseñaConClase(reseña) {
    const div = document.createElement('div');
    div.className = 'historialReseñas'; // Agregar la clase "historialReseñas"
    div.innerHTML = `<strong>${reseña.nombre}</strong><br>Estrellas: ${reseña.calificacion}<br>${reseña.texto}`;
    this.taula.appendChild(div);
}

  limpiarReseñas() {
      const transaction = this.db.transaction([this.objectStoreName], 'readwrite');
      const objectStore = transaction.objectStore(this.objectStoreName);
      const request = objectStore.clear();

      request.onsuccess = () => {
          console.log('Reseñas eliminadas con éxito');
          this.mostrarReseñas();
      };

      request.onerror = (event) => {
          console.error('Error al eliminar las reseñas:', event.target.errorCode);
      };
  }

  buscarReseña() {
      const nombreBusqueda = document.getElementById('reseñaNombre').value;
      const transaction = this.db.transaction([this.objectStoreName], 'readonly');
      const objectStore = transaction.objectStore(this.objectStoreName);
      const index = objectStore.index('nombre');
      const request = index.getAll(nombreBusqueda);

      request.onsuccess = () => {
          const reseñasFiltradas = request.result;
          this.mostrarReseñas(reseñasFiltradas);
      };

      request.onerror = (event) => {
          console.error('Error al buscar la reseña:', event.target.errorCode);
      };
  }

  mostrarReseñas(reseñas = null) {
      this.taula.innerHTML = '';

      const transaction = this.db.transaction([this.objectStoreName], 'readonly');
      const objectStore = transaction.objectStore(this.objectStoreName);
      const request = objectStore.getAll();

      request.onsuccess = () => {
          const reseñasMostrar = reseñas || request.result;

          reseñasMostrar.forEach((reseña, index) => {
              const div = document.createElement('div');
              div.className = 'reseña';
              div.innerHTML = `<strong>${reseña.nombre}</strong><br>Estrellas: ${reseña.calificacion}<br>${reseña.texto}`;
              this.taula.appendChild(div);
          });
      };

      request.onerror = (event) => {
          console.error('Error al mostrar las reseñas:', event.target.errorCode);
      };
  }
}

// Crear una instancia de la clase
const almacenReseñas = new AlmacenReseñas();

// Event Listeners
document.getElementById('guardarReseñaBtn').addEventListener('click', () => {
  almacenReseñas.guardarReseña();
});

document.getElementById('limpiarReseñasBtn').addEventListener('click', () => {
  almacenReseñas.limpiarReseñas();
});

document.getElementById('buscarReseñaBtn').addEventListener('click', () => {
  almacenReseñas.buscarReseña();
});