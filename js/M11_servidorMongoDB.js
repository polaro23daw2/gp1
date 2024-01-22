const http = require("http");
const fs = require('fs');
const url = require('url');
const querystring = require('querystring');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Reemplaza 'tuCadenaDeConexion' con tu cadena de conexión real a MongoDB
const cadenaConexion = 'mongodb://localhost:27017';

function usuarioYContraseñaSonCorrectos(db, username, password, callback) {
    db.collection('usuaris').findOne({ username: username }, function(err, user) {
        if (err) {
            callback(err, null);
        } else if (user && user.password === password) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    });
}

function iniciar() {
    function onRequest(request, response) {
        const parsedUrl = url.parse(request.url, true); // true para parsear también los parámetros
        const ruta = parsedUrl.pathname;

         if(ruta == '/index'  && request.method === 'GET'){
            fs.readFile("../html/index.html", function(err, html) {
                if (err) {
                    response.writeHead(500);
                    response.end('Error del servidor');
                } else {
                    response.writeHead(200, { "Content-Type": "text/html" });
                    console.log("he arribat");
                    response.end(html);
                }
            });
        }else if(ruta === '/login' && request.method === 'GET') {
            fs.readFile("../html/M11_login.html", function(err, html) {
                if (err) {
                    response.writeHead(500);
                    response.end('Error al leer el archivo');
                } else {
                    response.writeHead(200, { "Content-Type": "text/html" });
                    response.end(html);
                }
            });
        } else if (ruta === '/login' && request.method === 'POST') {
            let body = '';
            request.on('data', function(chunk) {
                body += chunk.toString();
            });
            request.on('end', function() {
                const post = querystring.parse(body);
                const username = post.username;
                const password = post.password;

                MongoClient.connect(cadenaConexion, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, client) {
                    assert.equal(null, err);
                    const db = client.db('daw2');
                    
                    usuarioYContraseñaSonCorrectos(db, username, password, function(err, correct) {
                        client.close();
                        if (err) {
                            response.writeHead(500);
                            response.end('Error del servidor');
                        } else if (correct) {
                            // Redirección a la página final
                            response.writeHead(302, {
                                "Location": "/final",
                                "Set-Cookie": `logged=true; username=${username}; HttpOnly`
                            });
                            response.end();
                        } else {
                            response.writeHead(401);
                            response.end('Usuario o contraseña incorrectos');
                        }
                    });
                });
            });
        } else if (ruta === '/register' && request.method === 'POST') {
            let body = '';
            request.on('data', function(chunk) {
                body += chunk.toString();
            });
            request.on('end', function() {
                const post = querystring.parse(body);
                const username = post.username;
                const password = post.password;
        
                MongoClient.connect(cadenaConexion, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, client) {
                    assert.equal(null, err);
                    const db = client.db('daw2');
        
                    db.collection('usuaris').findOne({ username: username }, function(err, user) {
                        if (err) {
                            client.close();
                            response.writeHead(500);
                            response.end('Error del servidor');
                        } else if (user) {
                            client.close();
                            response.writeHead(409); // Código de estado para conflicto
                            response.end('El usuario ya existe');
                        } else {
                            // Aquí insertarías el nuevo usuario
                            db.collection('usuaris').insertOne({ username: username, password: password }, function(err, res) {
                                client.close();
                                if (err) {
                                    response.writeHead(500);
                                    response.end('Error al registrar el usuario');
                                } else {
                                    // Usuario registrado correctamente
                                    response.writeHead(200);
                                    response.end('Usuario registrado con éxito');
                                }
                            });
                        }
                    });
                });
            });
    }else if(ruta === '/final') {
            // Verificar si la cookie de sesión está presente y es válida
            const cookies = parseCookies(request);
            if (cookies.logged && cookies.logged === 'true') {
                // Si la sesión es válida, servir final.html
                fs.readFile("../html/final.html", function(err, html) {
                    if (err) {
                        response.writeHead(500);
                        response.end('Error del servidor');
                    } else {
                        response.writeHead(200, { "Content-Type": "text/html" });
                        response.end(html);
                    }
                });
            }else {
                // Si no hay sesión válida, redirigir a la página de inicio de sesión
                response.writeHead(302, {
                    "Location": "/login"
                });
                response.end();
            }
        }else if (ruta.startsWith('../png/') || ruta.startsWith('../css/') || ruta.startsWith('../js/')) {
            const filePath = '.' + ruta;
            const fileExtension = filePath.split('.').pop();

            fs.readFile(filePath, function(err, content) {
                if (err) {
                    response.writeHead(404);
                    response.end('Archivo no encontrado');
                    return;
                }

                let contentType = 'text/plain';
                if (fileExtension === 'png') {
                    contentType = 'image/png';
                } else if (fileExtension === 'css') {
                    contentType = 'text/css';
                } else if (fileExtension === 'js') {
                    contentType = 'application/javascript';
                }

                response.writeHead(200, { "Content-Type": contentType });
                response.end(content, 'utf-8');
            });
        }
    }

    http.createServer(onRequest).listen(8888);
    console.log("Servidor iniciado en http://localhost:8888");
}
function parseCookies(request) {
    let list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function(cookie) {
        let parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}
exports.iniciar = iniciar;
