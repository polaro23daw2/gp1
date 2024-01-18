const http = require('http');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://<administrador>:<segura>@localhost:27017/<gp1>'; // Reemplaza con tus propias credenciales y URL de MongoDB
const port = 3000;

// Crear un servidor HTTP
const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    // Servir el formulario HTML en la ruta principal '/'
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Formulario de Inicio de Sesión</title>
        </head>
        <body>
          <h1>Iniciar Sesión</h1>
          <form method="POST" action="/login">
            <label for="username">Usuario:</label>
            <input type="text" id="username" name="username" required><br>
            <label for="password">Contraseña:</label>
            <input type="password" id="password" name="password" required><br>
            <button type="submit">Iniciar sesión</button>
          </form>
        </body>
      </html>
    `);
  } else if (req.method === 'POST' && req.url === '/login') {
    // Manejar la solicitud POST del formulario de inicio de sesión
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      const formData = new URLSearchParams(body);
      const username = formData.get('username');
      const password = formData.get('password');

      // Conectar a MongoDB y verificar las credenciales del usuario
      MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
        if (err) {
          console.error("Error al conectar a MongoDB:", err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error interno del servidor');
          return;
        }

        const db = client.db('<gp1>'); // Reemplaza con el nombre de tu base de datos

        // Realiza una consulta en la base de datos para verificar las credenciales del usuario
        db.collection('usuarios').findOne({ username, password }, (err, result) => {
          if (err) {
            console.error("Error al consultar la base de datos:", err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error interno del servidor');
          } else if (result) {
            // Credenciales válidas, permitir el acceso
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Inicio de sesión exitoso');
          } else {
            // Credenciales inválidas, mostrar un mensaje de error
            res.writeHead(401, { 'Content-Type': 'text/plain' });
            res.end('Credenciales incorrectas');
          }

          // Cierra la conexión a la base de datos
          client.close();
        });
      });
    });
  } else {
    // Manejar rutas no válidas
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Página no encontrada');
  }
});

// Iniciar el servidor en el puerto especificado
server.listen(port, () => {
  console.log(`Servidor en ejecución en http://localhost:${port}`);
});
