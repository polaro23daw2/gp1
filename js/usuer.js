class Usuario {
    constructor(correo, codigoPostal) {
        this.correo = correo;
        this.codigoPostal = codigoPostal;
    }

    obtenerContacto() {
        return `Correo: ${this.correo}, Código Postal: ${this.codigoPostal}`;
    }
}

class Visitante extends Usuario {
    constructor(nombre, apellido) {
        // Llamada al constructor de la superclase con el método super()
        super(null, null);
        this.nombre = nombre;
        this.apellido = apellido;
    }

    obtenerInformacionCompleta() {
        return `Nombre: ${this.nombre} ${this.apellido}, ${this.obtenerContacto()}`;
    }
}

class Cliente extends Usuario {
    constructor(nombre, apellido, correo, codigoPostal) {
        super(correo, codigoPostal);
        this.nombre = nombre;
        this.apellido = apellido;
    }

    obtenerInformacionCompleta() {
        return `Nombre: ${this.nombre} ${this.apellido}, ${this.obtenerContacto()}`;
    }
}