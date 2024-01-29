class AlmacenReseñas {
  constructor(contenedorClass) {
    this.contenedor = document.querySelector(`.${contenedorClass}`);
    this.dbName = 'ReseñasDB32';
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

  mostrarReseñas(reseñas = null) {
    if (!this.contenedor) {
      console.error('No se encontró el contenedor.');
      return;
    }

    this.contenedor.innerHTML = '';

    const transaction = this.db.transaction([this.objectStoreName], 'readonly');
    const objectStore = transaction.objectStore(this.objectStoreName);
    const request = objectStore.getAll();

    request.onsuccess = () => {
      const reseñasMostrar = reseñas || request.result;

      // Calcula el promedio de calificaciones
      const totalReseñas = reseñasMostrar.length;
      const totalCalificaciones = reseñasMostrar.reduce((sum, reseña) => sum + parseInt(reseña.calificacion), 0);
      const averageRating = totalReseñas > 0 ? (totalCalificaciones / totalReseñas).toFixed(1) : 0;

      // Agrega las etiquetas <p> con el promedio de calificaciones y el total de reseñas al contenedor principal
      const p1 = document.createElement('p');
      p1.id = 'averageRating';
      p1.innerHTML = `<span id="average-rating">${averageRating}</span><img src="../png/star.png" height="30px">`;
      this.contenedor.appendChild(p1);

      const p2 = document.createElement('p');
      p2.id = 'total-reviews';
      p2.innerHTML = `Total de reseñas: <span id="review-count">${totalReseñas}</span>`;
      this.contenedor.appendChild(p2);

      // Agrega las reseñas al contenedor con líneas delgadas entre ellas
      reseñasMostrar.forEach((reseña, index) => {
        const div = document.createElement('div');
        div.className = 'historialReseñasItem';
        div.innerHTML = `<strong>${reseña.nombre}</strong><br>Estrellas: ${reseña.calificacion}<br>${reseña.texto}`;
        this.contenedor.appendChild(div);

        // Agrega una línea delgada entre cada reseña, excepto la última
        if (index < totalReseñas - 1) {
          const linea = document.createElement('hr');
          linea.className = 'lineaDelgada';
          this.contenedor.appendChild(linea);
        }
      });
    };

    request.onerror = (event) => {
      console.error('Error al mostrar las reseñas:', event.target.errorCode);
    };
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
    const nombreBuscar = document.getElementById('buscarReseña').value.trim().toLowerCase();

    const transaction = this.db.transaction([this.objectStoreName], 'readonly');
    const objectStore = transaction.objectStore(this.objectStoreName);
    const index = objectStore.index('nombre');

    const keyRange = IDBKeyRange.bound(nombreBuscar, nombreBuscar + '\uffff'); // Rango de búsqueda

    const request = index.openCursor(keyRange);

    const reseñasEncontradas = [];

    request.onsuccess = (event) => {
      const cursor = event.target.result;

      if (cursor) {
        reseñasEncontradas.push(cursor.value);
        cursor.continue();
      } else {
        // Cuando no hay más coincidencias, mostrar las reseñas encontradas
        this.mostrarReseñas(reseñasEncontradas);
      }
    };

    request.onerror = (event) => {
      console.error('Error al buscar reseñas:', event.target.errorCode);
    };
  }
}

const almacenReseñas = new AlmacenReseñas('historialReseñas');

// Agrega un evento 'input' al campo de búsqueda para buscar automáticamente
document.getElementById('buscarReseña').addEventListener('input', () => {
  almacenReseñas.buscarReseña();
});

document.getElementById('guardarReseñaBtn').addEventListener('click', () => {
  almacenReseñas.guardarReseña();
});

document.getElementById('limpiarReseñasBtn').addEventListener('click', () => {
  almacenReseñas.limpiarReseñas();
});
