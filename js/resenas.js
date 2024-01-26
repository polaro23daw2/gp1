class AlmacenReseñas {
  constructor(contenedorClass) {
    this.contenedor = document.querySelector(`.${contenedorClass}`);
    this.dbName = 'ReseñasDB32'; // Nombre de la base de datos fijo
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
    };

    request.onerror = (event) => {
      console.error('Error al añadir la reseña:', event.target.errorCode);
    };
  }

  mostrarReseñas() {
    if (!this.contenedor) {
      console.error('No se encontró el contenedor.');
      return;
    }

    this.contenedor.innerHTML = '';

    const transaction = this.db.transaction([this.objectStoreName], 'readonly');
    const objectStore = transaction.objectStore(this.objectStoreName);
    const request = objectStore.getAll();

    request.onsuccess = () => {
      const reseñasMostrar = request.result;

      reseñasMostrar.forEach((reseña, index) => {
        const div = document.createElement('div');
        div.className = 'historialReseñas';
        div.innerHTML = `<strong>${reseña.nombre}</strong><br>Estrellas: ${reseña.calificacion}<br>${reseña.texto}`;
        this.contenedor.appendChild(div);
      });
    };

    request.onerror = (event) => {
      console.error('Error al mostrar las reseñas:', event.target.errorCode);
    };
  }

  limpiarReseñas() {
    // Puedes implementar la lógica para limpiar reseñas aquí
    console.log('Reseñas limpiadas con éxito');
    this.mostrarReseñas(); // Puedes llamar a mostrarReseñas después de limpiar si es necesario
  }

  buscarReseña() {
    // Puedes implementar la lógica de búsqueda de reseñas aquí
    console.log('Buscando reseñas...');
  }
}

// Crear una instancia de la clase con el nombre de la clase del contenedor
const almacenReseñas = new AlmacenReseñas('historialReseñas');

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
