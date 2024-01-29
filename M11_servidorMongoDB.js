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

function obtenerUsuarios(db, callback) {
    db.collection('usuaris').find({}).toArray(function(err, docs) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, docs);
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
                        }else if (correct) {
                            response.setHeader('Set-Cookie', [`username=${username}; Path=/;`, `loged=true; Path=/;`]);
                        
                            const adminUsers = ['admin'];
                            if (adminUsers.includes(username)) {
                                response.setHeader('Set-Cookie', ['administrador=true; Path=/;', `username=${username};Path=/;`,`loged=true; Path=/;`]);
                                console.log("Cookie de politica añadida");
                            }
                        
                            console.log("Usuario logueado:", username);
                            response.writeHead(302, { "Location": "/index" });
                            response.end();
                        }
                         else {
                            response.writeHead(401);
                            response.end('Usuario o contraseña incorrectos');
                        }
                    });
                }
                );
            }
            );
        } else if (ruta === '/loginPagina' && request.method === 'GET') {
            fs.readFile("html/login.html", function (err, html) {
                if (err) {
                    console.error("Error al leer login.html:", err);
                    response.writeHead(500);
                    response.end('Error del servidor: ' + err.message);
                    return;
                }
                response.writeHead(200, { "Content-Type": "text/html" });
                response.end(html);
            });
        } else if (ruta === '/register' && request.method === 'POST') {
            let body = '';
            request.on('data', function (chunk) {
                body += chunk.toString();
            });
            request.on('end', function () {
                const post = querystring.parse(body);
                console.log("Datos recibidos:", post);
                const username = post.username;
                const password = post.password;
                const mail = post.mail;

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
                            db.collection('usuaris').insertOne({ username: username, password: password, mail: mail }, function (err, res) {
                                client.close();
                                if (err) {
                                    response.writeHead(500);
                                    response.end('Error al registrar el usuario');
                                } else {
                                    response.writeHead(302, {
                                        "Location": "/index",
                                        "Set-Cookie": `username=${username}; Path=/;`
                                    });
                                    response.end();
                                }
                            });
                        }
                    });
                });
            });
        } else if (ruta === '/restablecer' && request.method === 'POST') {
            let body = '';
            request.on('data', function (chunk) {
                body += chunk.toString();
            });
            request.on('end', function () {
                const post = querystring.parse(body);
                const username = post.username;
                const mail = post.mail;
                const password = post.password;
                const confirmPassword = post.confirmPassword;
                if (password !== confirmPassword) {
                    response.writeHead(400);
                    response.end('Las contraseñas no coinciden');
                    return;
                }

                MongoClient.connect(cadenaConexion, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
                    assert.equal(null, err);
                    const db = client.db('daw2');

                    db.collection('usuaris').findOne({ username: username, mail: mail }, function (err, user) {
                        if (err) {
                            client.close();
                            response.writeHead(500);
                            response.end('Error del servidor');
                            return;
                        }

                        if (!user) {
                            client.close();
                            response.writeHead(404);
                            response.end('Usuario no encontrado');
                            return;
                        }

                        db.collection('usuaris').updateOne(
                            { _id: user._id },
                            { $set: { password: password } },
                            function (err, result) {
                                client.close();
                                if (err) {
                                    response.writeHead(500);
                                    response.end('Error al actualizar la contraseña');
                                } else {
                                    response.writeHead(302, { "Location": "/loginPagina" });
                                    response.end();
                                }
                            }
                        );
                    });
                });
            });
        } else if (ruta === '/obtener-usuarios' && request.method === 'GET') {
            MongoClient.connect(cadenaConexion, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
                if (err) {
                    response.writeHead(500);
                    response.end("Error de conexión a la base de datos");
                    return;
                }
                const db = client.db('daw2');
        
                obtenerUsuarios(db, function(err, users) {
                    client.close();
                    if (err) {
                        response.writeHead(500);
                        response.end("Error al recuperar usuarios");
                    } else {
                        response.writeHead(200, { "Content-Type": "application/json" });
                        response.end(JSON.stringify(users));
                    }
                });
            });
        }else if (ruta.startsWith('/css/') || ruta.startsWith('/js/') || ruta.startsWith('/png/') || ruta.startsWith('/html/')) {
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
                } else if (fileExtension === 'pdf') {
                    contentType = 'application/pdf';
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