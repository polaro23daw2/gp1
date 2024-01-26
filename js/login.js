const container = document.getElementById('contenedor');
const registerBtn = document.getElementById('registrarse');
const loginBtn = document.getElementById('iniciar-sesion');

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});
