// Archivo: miScript.js
// autor ARJO BLAGUER AROCA

document.addEventListener('DOMContentLoaded', function () {
    // Obtener el lienzo y su contexto
    var canvas = document.getElementById('myCanvas');
    var ctx = canvas.getContext('2d');

    // Obtener el texto desde el atributo personalizado
    var texto = canvas.dataset.texto;

    // Crear un degradado para el color del texto
    var gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#3498db'); // Azul
    gradient.addColorStop(1, '#2ecc71'); // Verde

    // Establecer el estilo de fuente y color de texto
    ctx.font = 'bold 40px "Arial Black", Gadget, sans-serif';
    ctx.fillStyle = gradient; // Usar el degradado como color de texto
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Dibujar el texto en el lienzo
    ctx.fillText(texto, canvas.width / 2, canvas.height / 2);
});
