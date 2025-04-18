const bcrypt = require('bcrypt'); // Agregalo al principio de tu app.js
const session = require('express-session');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const db = require('./models/database');


app.use((req, res, next) => {
    console.log("📥 Request recibida:", req.method, req.url);
    next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));


// Configuración de la vista
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configuración de body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Ruta de inicio
app.get('/login', (req, res) => {
    res.render('login'); // ✅ Carga la vista login.ejs
});

// Ruta de registro
app.get('/register', (req, res) => {
    res.render('register');  // Mostrar formulario de registro
});

//Aca vamos a encryptar los usuarios

app.post('/register', async (req, res) => {
    const { usuario, contraseña, rol } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        db.run(`INSERT INTO usuarios (usuario, contraseña, rol) VALUES (?, ?, ?)`, [usuario, hashedPassword, rol], (err) => {
            if (err) {
                console.log('Error al registrar el usuario:', err.message);
                return res.send('Error al registrar el usuario'); // 👈 Cortar ejecución si hay error
            }

            return res.redirect('/login'); //  Solo si se insertó correctamente
        });

    } catch (error) {
        console.error(error);
        return res.send('Error en el registro');
    }
});

app.use(session({
    secret: 'tu_clave_secreta', // Podés poner cualquier string secreto
    resave: false,
    saveUninitialized: false
  }));


// Ruta de login
app.post('/login', (req, res) => {
    const { usuario, contraseña } = req.body;

    console.log("🟢 Login recibido:");
    console.log("Usuario:", usuario);
    console.log("Contraseña:", contraseña);

    db.get('SELECT * FROM usuarios WHERE usuario = ?', [usuario], async (err, user) => {
        if (err || !user) {

            console.log("🔴 Error en la consulta SQL:", err);
            return res.send('Usuario no encontrado');
        }

        if (!user) {
            console.log("🔴 Usuario no encontrado");
            return res.send('Usuario no encontrado');
        }

        try  {

                const match = await bcrypt.compare(contraseña, user.contraseña);
                if (match) {
                    console.log("🟢 Contraseña válida. Usuario autenticado.")

                    req.session.userId = user.id;
                    req.session.userRol = user.rol;
                    req.session.usuario = user.usuario; // 👈 para que lo puedas mostrar en el dashboard

                    res.redirect('/dashboard'); // <-- redirige al dashboard
                } else {
                    console.log("🔴 Contraseña incorrecta");
                    res.send('Contraseña incorrecta');
                }
            } catch (error) {
                console.log("🔴 Error en bcrypt:", error);
                console.error(error);
                res.send('Hubo un error al procesar la contraseña');
            }
        });
    });


//----------------- provisorio
app.get('/admin', (req, res) => {
    res.send('Página de Administración (en construcción)');
});

app.get('/operaciones', (req, res) => {
    res.send('Página de Operaciones (en construcción)');
});

app.get('/usuarios', requireRole('admin'), (req, res) => {
    res.send('Listado de usuarios (en construcción)');
});

app.get('/clientes', requireRole('admin'), (req, res) => {
    res.send('Listado de clientes (en construcción)');
});

//-------------------------------

    app.get('/dashboard', (req, res) => {
        if (!req.session.userId) return res.redirect('/');
    
        res.render('dashboard', { usuario: req.session.usuario });
    });

    // MIDDLEWARE
    function requireRole(role) {
        return function (req, res, next) {
            if (!req.session || !req.session.userRol) {
                return res.status(403).send('Acceso denegado');
            }
            if (req.session.userRol !== role) {
                return res.status(403).send('No tenés permiso para esta acción');
            }
            next();
        }
    }


// Ruta para añadir producto
app.get('/add-product', requireRole('admin'), (req, res) => {
    res.render('add-product');  // Mostrar formulario de añadir producto
});

app.post('/add-product', requireRole('admin'), (req, res) => {
    const { nombre, descripcion, codigo_barra, UxCaja, Categoria, sub_categoria } = req.body;

    //nombre TEXT NOT NULL,
 // descripcion TEXT NOT NULL,
  //codigo_barra INTEGER UNIQUE NOT NULL,
  //UxCaja INTEGER NOT NULL,
 // Categoria TEXT NOT NULL,
//sub_categoria TEXT NOT NULL

    // Insertar el nuevo producto en la base de datos
    db.run(
        `INSERT INTO productos (nombre, descripcion, codigo_barra, UxCaja, Categoria, sub_categoria) VALUES (?, ?, ?, ?, ?, ?)`, 
        [nombre, descripcion, codigo_barra, UxCaja, Categoria, sub_categoria],
        (err) => {
        if (err) {
            console.error("Error al agregar producto:", err);
                return res.send('Error al agregar producto');
        }
        // Redirigir al dashboard o al listado de productos
        res.redirect('/dashboard');
    });
});

// Ruta de Dashboard
app.get('/dashboard', (req, res) => {
    db.all('SELECT * FROM productos', [], (err, rows) => {
        if (err) {
            return console.log(err.message);
        }
        res.render('dashboard', { products: rows });
    });
});

// Mostrar todos los productos
app.get('/products', requireRole('admin'), (req, res) => {
    db.all('SELECT * FROM productos', (err, rows) => {
        if (err) return res.send('Error al obtener productos');
        res.render('products', { products: rows, req });
    });
});

// Mostrar formulario para agregar producto
app.get('/products/new', requireRole('admin'), (req, res) => {
    res.render('new-product');
  });

// Guardar nuevo producto
app.post('/products/new', requireRole('admin'), (req, res) => {
    const { nombre, descripcion, codigo_barra, UxCaja, Categoria, sub_categoria } = req.body;
    db.run('INSERT INTO productos (nombre, descripcion, codigo_barra, UxCaja, Categoria, sub_categoria) VALUES (?, ?, ?, ?, ?, ?)', [nombre, descripcion, codigo_barra, UxCaja, Categoria, sub_categoria], (err) => {
        if (err) return res.send('Error al agregar producto');
        res.redirect('/products');
    });
});

// Mostrar formulario para editar
app.get('/products/edit/:id', requireRole('admin'), (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM productos WHERE id = ?', [id], (err, product) => {
        if (err || !product) return res.send('Producto no encontrado');
        res.render('edit-product', { product });
    });
});


// Actualizar producto
app.post('/products/edit/:id', requireRole('admin'), (req, res) => {
    const { nombre, descripcion, codigo_barra, UxCaja, Categoria, sub_categoria } = req.body;
    const id = req.params.id;
    db.run('UPDATE productos SET nombre = ?, descripcion = ?, codigo_barra = ?, UxCaja = ?, Categoria = ?, sub_categoria = ? WHERE id = ?',
         [nombre, descripcion, codigo_barra, UxCaja, Categoria, sub_categoria, id], (err) => {

        if (err) return res.send('Error al actualizar');
        res.redirect('/products?actualizado=1');
    });
});

// Eliminar producto
app.get('/products/delete/:id', requireRole('admin'), (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM productos WHERE id = ?', [id], (err) => {
        if (err) return res.send('Error al eliminar');
        res.redirect('/products');
    });
});

// Puerto de escucha
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});