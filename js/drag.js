// Esta función inicia el proceso de arrastre y guarda el ID del elemento arrastrado.
function dragStart(event) {
    event.dataTransfer.setData("text", event.target.id);
}

// Esta función se llama cuando un elemento arrastrable entra en un destino de soltar.
function dragEnter(event) {
    if (event.target.classList.contains("droppable")) {
        event.target.classList.add("droppable-hover");
    }
}

// Esta función se llama cuando un elemento arrastrable está sobre un destino de soltar.
function dragOver(event) {
    if (event.target.classList.contains("droppable")) {
        event.preventDefault(); // Necesario para permitir el evento drop.
    }
}

// Esta función se llama cuando un elemento arrastrable sale de un destino de soltar.
function dragLeave(event) {
    if (event.target.classList.contains("droppable")) {
        event.target.classList.remove("droppable-hover");
    }
}

// Esta función se llama cuando un elemento arrastrable se suelta sobre un destino de soltar.
function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData('text');
    const dropZone = event.target.closest('.droppable');
    const span = dropZone.querySelector('span');
    const resultadoDiv = dropZone.querySelector('.resultado');

    span.textContent = data; // Establecer el nuevo texto.
    span.classList.add('dropped');
    dropZone.classList.remove('droppable-hover');

    const esCorrecto = verificarSiEsCorrecto(dropZone.id, data);
    if (esCorrecto) {
        // Agregar el icono de verificación después del texto
        resultadoDiv.classList.add('correcto');
        resultadoDiv.classList.remove('incorrecto');
    } else {
        // Agregar el icono de error después del texto
        resultadoDiv.classList.remove('correcto');
        resultadoDiv.classList.add('incorrecto');
    }
}

// Resto del código sin cambios


function verificarSiEsCorrecto(idTop, pais) {
    const ordenCorrecto = {
        'top1': 'Brasil',
        'top2': 'Rusia',
        'top3': 'Canadá',
        'top4': 'Indonesia',
        'top5': 'China'
    };
    return ordenCorrecto[idTop] === pais;
}



// Asociar eventos a los elementos arrastrables y a los destinos de soltar.
var paises = document.querySelectorAll('.draggable');
var tops = document.querySelectorAll('.droppable');

paises.forEach(pais => {
    pais.addEventListener('dragstart', dragStart);
});

tops.forEach(top => {
    top.addEventListener('dragenter', dragEnter);
    top.addEventListener('dragover', dragOver);
    top.addEventListener('dragleave', dragLeave);
    top.addEventListener('drop', drop);
});
