const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const getConnection = require('../conexion'); // Asegúrate de que esta ruta sea correcta

// Ruta para registrar un usuario
router.post('/register', [
    body('name').matches(/^[a-zA-Z\s]+$/).withMessage('Name must contain only letters'),
    body('email').isEmail().withMessage('Must be a valid email'),
    body('cedula').isNumeric().withMessage('Cedula must contain only numbers'),
    body('age').isInt({ min: 18, max: 65 }).withMessage('Age must be between 18 and 65'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, cedula, age, password } = req.body;
    const sql = 'INSERT INTO users (name, email, cedula, age, password) VALUES (?, ?, ?, ?, ?)';

    getConnection((err, conn) => {
        if (err) {
            return res.status(500).send('Error connecting to the database');
        }
        conn.query(sql, [name, email, cedula, age, password], (err, result) => {
            conn.release();
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Error saving user to database');
            }
            res.send('User registered successfully');
        });
    });
});

module.exports = router;
