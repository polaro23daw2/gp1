function guardarReseña() {
    const nombreUsuario = document.getElementById('reseñaNombre').value;
    const nuevaReseña = document.getElementById('reseñaTexto').value;
    const calificacion = document.getElementById('calificacion').value;

    // Obtener las reseñas existentes desde localStorage
    const reseñasExistente = localStorage.getItem('reseñas') ? JSON.parse(localStorage.getItem('reseñas')) : [];

    // Agregar la nueva reseña al array
    reseñasExistente.push({
      nombre: nombreUsuario,
      texto: nuevaReseña,
      calificacion: calificacion,
      fecha: new Date().toLocaleString()
    });

    // Almacenar el array actualizado en localStorage
    localStorage.setItem('reseñas', JSON.stringify(reseñasExistente));

    // Limpiar los campos de texto y la calificación
    document.getElementById('reseñaNombre').value = '';
    document.getElementById('reseñaTexto').value = '';
    document.getElementById('calificacion').value = '';

    // Actualizar la visualización de las reseñas
    mostrarReseñas();
  }

  function limpiarReseñas() {
    // Limpiar todas las reseñas almacenadas en localStorage
    localStorage.removeItem('reseñas');

    // Actualizar la visualización de las reseñas
    mostrarReseñas();
  }

  function mostrarReseñas() {
    const historialReseñas = document.getElementById('historialReseñas');
    historialReseñas.innerHTML = '';

    // Obtener las reseñas desde localStorage
    const reseñas = localStorage.getItem('reseñas') ? JSON.parse(localStorage.getItem('reseñas')) : [];

    // Mostrar las reseñas en bloques
    reseñas.forEach((reseña, index) => {
      const div = document.createElement('div');
      div.className = 'review';
      div.innerHTML = `<div class="user">${reseña.nombre}</div>
                       <div class="date">${reseña.fecha}</div>
                       <div class="comment">${reseña.texto}</div>
                       <div class="rating">Calificación: ${reseña.calificacion}</div>`;
      historialReseñas.appendChild(div);

      // Separador visual entre reseñas
      if (index !== reseñas.length - 1) {
        const hr = document.createElement('hr');
        historialReseñas.appendChild(hr);
      }
    });
  }

  // Mostrar las reseñas al cargar la página
  mostrarReseñas();