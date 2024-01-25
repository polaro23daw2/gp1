const http = require("http");
const fs = require('fs');
const url = require('url');
const querystring = require('querystring');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const cadenaConexion = 'mongodb://localhost:27017';

function usuarioYContraseñaSonCorrectos(db, username, password, callback) {
    db.collection('usuaris').findOne({ username: username }, function (err, user) {
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
        const parsedUrl = url.parse(request.url, true);
        const ruta = parsedUrl.pathname;

        if (ruta === '/index' && request.method === 'GET') {
            fs.readFile("html/index.html", function (err, html) {
                if (err) {
                    console.error("Error al leer index.html:", err);
                    response.writeHead(500);
                    response.end('Error del servidor: ' + err.message);
                    return;
                }
                response.writeHead(200, { "Content-Type": "text/html" });
                response.end(html);
            });

        } else if (ruta === '/marco.html' && request.method === 'GET') {
            fs.readFile("html/marco.html", function (err, html) {
                if (err) {
                    response.writeHead(500);
                    response.end('Error al leer el archivo marco.html');
                } else {
                    response.writeHead(200, { "Content-Type": "text/html" });
                    response.end(html);
                }
            });
        } else if (ruta === '/login' && request.method === 'POST') {
            let body = '';
            request.on('data', function (chunk) {
                body += chunk.toString();
            });
            request.on('end', function () {
                const post = querystring.parse(body);
                const username = post.username;
                const password = post.password;

                MongoClient.connect(cadenaConexion, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
                    assert.equal(null, err);
                    const db = client.db('daw2');

                    usuarioYContraseñaSonCorrectos(db, username, password, function (err, correct) {
                        client.close();
                        if (err) {
                            response.writeHead(500);
                            response.end('Error del servidor');
                        } else if (correct) {
                            // Redirección a la página final
                            response.writeHead(302, {
                                "Location": "/index",
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
            request.on('data', function (chunk) {
                body += chunk.toString();
            });
            request.on('end', function () {
                const post = querystring.parse(body);
                const username = post.username;
                const password = post.password;
        
                MongoClient.connect(cadenaConexion, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
                    assert.equal(null, err);
                    const db = client.db('daw2');
        
                    db.collection('usuaris').findOne({ username: username }, function (err, user) {
                        if (err) {
                            client.close();
                            response.writeHead(500);
                            response.end('Error del servidor');
                        } else if (user) {
                            client.close();
                            response.writeHead(409);
                            response.end('El usuario ya existe');
                        } else {
                            db.collection('usuaris').insertOne({ username: username, password: password }, function (err, res) {
                                client.close();
                                if (err) {
                                    response.writeHead(500);
                                    response.end('Error al registrar el usuario');
                                } else {
                                    // Usuario registrado correctamente, establece una cookie y redirige a /index
                                    response.writeHead(302, {
                                        "Location": "/index",
                                        "Set-Cookie": `logged=true; username=${username}; HttpOnly`
                                    });
                                    response.end();
                                }
                            });
                        }
                    });
                });
            });
        }
         else if (ruta === '/final') {
            const cookies = parseCookies(request);
            if (cookies.logged && cookies.logged === 'true') {
                fs.readFile("html/index.html", function (err, html) {
                    if (err) {
                        response.writeHead(500);
                        response.end('Error del servidor');
                    } else {
                        response.writeHead(200, { "Content-Type": "text/html" });
                        response.end(html);
                    }
                });
            } else {
                response.writeHead(302, {
                    "Location": "/login"
                });
                response.end();
            }
        } else if (ruta.startsWith('/css/') || ruta.startsWith('/js/') || ruta.startsWith('/png/') || ruta.startsWith('/html/')) {
            const filePath = ruta.substring(1);
            const fileExtension = ruta.split('.').pop();

            fs.readFile(filePath, function (err, content) {
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
                } else if (fileExtension === 'html') {
                    contentType = 'text/html';
                }


                response.writeHead(200, { "Content-Type": contentType });
                response.end(content);
            });
        } else {
            response.writeHead(404);
            response.end("Ruta no encontrada");
        }
    }

    http.createServer(onRequest).listen(8888);
    console.log("Servidor iniciado en http://localhost:8888/index");
}

function parseCookies(request) {
    let list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function (cookie) {
        let parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}

exports.iniciar = iniciar;