document.getElementById('mostrarInfoBtn').addEventListener('click', function() {
    const visitante1 = new Visitante('Juan', 'Pérez');
    const cliente1 = new Cliente('María', 'Gómez', 'maria@gmail.com', '54321');

    const infoVisitante = visitante1.obtenerInformacionCompleta();
    const infoCliente = cliente1.obtenerInformacionCompleta();
    const infoContainer = document.getElementById('infoContainer');

    infoContainer.innerHTML = '';

    const visitanteParagraph = document.createElement('p');
    visitanteParagraph.textContent = `Información del Visitante: ${infoVisitante}`;
    infoContainer.appendChild(visitanteParagraph);

    const clienteParagraph = document.createElement('p');
    clienteParagraph.textContent = `Información del Cliente: ${infoCliente}`;
    infoContainer.appendChild(clienteParagraph);
});
