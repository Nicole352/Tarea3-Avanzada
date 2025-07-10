const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const mysql = require('mysql2');

const app = express();

// Configurar middlewares
app.use(bodyParser.json());
app.use(cors());

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '2002',
    database: 'formulario',
    connectionLimit: 10
});

// Middleware para manejar conexiones de la base de datos
const getConnection = (callback) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error al obtener conexión:', err);
            callback(err, null);
        } else {
            callback(null, connection);
        }
    });
};

// Ruta para registrar un usuario
app.post('/register', [
    body('name').matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo debe contener letras'),
    body('email').isEmail().withMessage('Debe ser un correo electrónico válido'),
    body('cedula').isNumeric().withMessage('La cédula debe contener solo números'),
    body('age').isInt({ min: 18, max: 65 }).withMessage('La edad debe estar entre 18 y 65 años'),
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
], (req, res) => {
    console.log('Datos recibidos:', req.body); // Para debug
    
    // Validar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Errores de validación:', errors.array());
        return res.status(400).json({ 
            success: false,
            message: 'Errores de validación',
            errors: errors.array() 
        });
    }

    const { name, email, cedula, age, password } = req.body;
    const sql = 'INSERT INTO users (name, email, cedula, age, password) VALUES (?, ?, ?, ?, ?)';

    getConnection((err, conn) => {
        if (err) {
            console.error('Error de conexión:', err);
            return res.status(500).json({
                success: false,
                message: 'Error al conectar con la base de datos',
                error: err.message
            });
        }

        conn.query(sql, [name, email, cedula, age, password], (err, result) => {
            conn.release();
            
            if (err) {
                console.error('Database error:', err);
                
                // Manejar errores específicos de MySQL
                if (err.code === 'ER_DUP_ENTRY') {
                    if (err.sqlMessage.includes('email')) {
                        return res.status(409).json({
                            success: false,
                            message: 'Este correo electrónico ya está registrado',
                            field: 'email'
                        });
                    }
                    if (err.sqlMessage.includes('cedula')) {
                        return res.status(409).json({
                            success: false,
                            message: 'Esta cédula ya está registrada',
                            field: 'cedula'
                        });
                    }
                }
                
                return res.status(500).json({
                    success: false,
                    message: 'Error al guardar el usuario en la base de datos',
                    error: err.message
                });
            }

            // Éxito
            console.log('Usuario registrado con éxito, ID:', result.insertId);
            res.status(201).json({
                success: true,
                message: 'Usuario registrado con éxito',
                userId: result.insertId
            });
        });
    });
});

// ========== RUTAS GET AGREGADAS ==========

// GET - Obtener todos los usuarios
app.get('/users', (req, res) => {
    console.log('Petición GET recibida para obtener todos los usuarios');
    
    const sql = 'SELECT id, name, email, cedula, age FROM users'; // No incluimos password por seguridad
    
    getConnection((err, conn) => {
        if (err) {
            console.error('Error de conexión:', err);
            return res.status(500).json({
                success: false,
                message: 'Error al conectar con la base de datos',
                error: err.message
            });
        }

        conn.query(sql, (err, results) => {
            conn.release();
            
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error al obtener usuarios de la base de datos',
                    error: err.message
                });
            }

            console.log('Usuarios obtenidos:', results.length);
            res.status(200).json({
                success: true,
                message: 'Usuarios obtenidos exitosamente',
                count: results.length,
                data: results
            });
        });
    });
});

// GET - Obtener un usuario por ID
app.get('/users/:id', (req, res) => {
    const userId = req.params.id;
    console.log('Petición GET recibida para usuario ID:', userId);
    
    // Validar que el ID sea un número
    if (isNaN(userId)) {
        return res.status(400).json({
            success: false,
            message: 'El ID debe ser un número válido'
        });
    }
    
    const sql = 'SELECT id, name, email, cedula, age FROM users WHERE id = ?';
    
    getConnection((err, conn) => {
        if (err) {
            console.error('Error de conexión:', err);
            return res.status(500).json({
                success: false,
                message: 'Error al conectar con la base de datos',
                error: err.message
            });
        }

        conn.query(sql, [userId], (err, results) => {
            conn.release();
            
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error al obtener usuario de la base de datos',
                    error: err.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            console.log('Usuario encontrado:', results[0]);
            res.status(200).json({
                success: true,
                message: 'Usuario encontrado',
                data: results[0]
            });
        });
    });
});

// GET - Buscar usuarios por email (opcional)
app.get('/users/email/:email', (req, res) => {
    const email = req.params.email;
    console.log('Petición GET recibida para email:', email);
    
    const sql = 'SELECT id, name, email, cedula, age FROM users WHERE email = ?';
    
    getConnection((err, conn) => {
        if (err) {
            console.error('Error de conexión:', err);
            return res.status(500).json({
                success: false,
                message: 'Error al conectar con la base de datos',
                error: err.message
            });
        }

        conn.query(sql, [email], (err, results) => {
            conn.release();
            
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error al buscar usuario en la base de datos',
                    error: err.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado con ese email'
                });
            }

            console.log('Usuario encontrado por email:', results[0]);
            res.status(200).json({
                success: true,
                message: 'Usuario encontrado',
                data: results[0]
            });
        });
    });
});

// Middleware para manejar errores no capturados
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: err.message
    });
});

app.listen(3000, () => {
    console.log('Servidor corriendo en el puerto 3000');
});