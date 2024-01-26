////////////////////////para el canvas////////////////////
document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('myChart').getContext('2d');
    const chart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: ['Uso Doméstico', 'Entorno Industrial', 'Ganado', 'Irrigación'],
            datasets: [{
                data: [10.7, 21.3, 0.4, 67.6], // Porcentajes actualizados
                backgroundColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(200, 200, 200, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Distribución del Uso del Agua en España'
                }
            },
            responsive: false,
            maintainAspectRatio: false, 
        }
    });
});

////////////////para que reconozca la cookie en el span usernameDisplay ////////////////
document.addEventListener('DOMContentLoaded', function () {
const usernameDisplayElement = document.getElementById('usernameDisplay');
if (usernameDisplayElement) {
const loggedValue = getCookie('username');
usernameDisplayElement.textContent = loggedValue || 'Invitado';
}
});

function getCookie(name) {
const nameEQ = name + "=";
const ca = document.cookie.split(';');
for(let i=0; i < ca.length; i++) {
let c = ca[i];
while (c.charAt(0) === ' ') c = c.substring(1, c.length);
if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
}
return null;
}