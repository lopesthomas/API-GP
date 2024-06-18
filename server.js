const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
    const numCPUs = os.cpus().length;

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Forking a new worker.`);
        cluster.fork();
    });
} else {
    const express = require('express');
    const mysql = require('mysql');
    const bodyParser = require('body-parser');
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');
    require("dotenv").config();

    const app = express();
    const port = 3000;

    app.use(bodyParser.json());

    const pool = mysql.createPool({
        connectionLimit: 100, // Ajuster selon les besoins
        host: `${process.env.HOST}`,
        user: `${process.env.USER}`,
        password: `${process.env.PASSWORD}`,
        database: `${process.env.DATA_BASE}`,
        acquireTimeout: 30000,
        waitForConnections: true,
        queueLimit: 0,
        reconnect: true,
    });

    pool.on('error', (err) => {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Connection lost: Reconnecting...');
        } else {
            console.error('Database error:', err);
            throw err;
        }
    });

    // Clé secrète pour JWT (à garder secrète et sécurisée)
    const JWT_SECRET = 'your_secret_key';

    // Route pour l'inscription d'un nouvel utilisateur (pour ajouter des utilisateurs avec un mot de passe haché)
    app.post('/register', async (req, res) => {
        const { mail, password } = req.body;
        if (!mail || !password) {
            return res.status(400).send('Username and password are required');
        }

        // Hacher le mot de passe avant de le stocker
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { mail, password: hashedPassword };

        pool.query('INSERT INTO users SET ?', newUser, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.status(201).json({ id: result.insertId, mail });
        });
    });

    // Route pour la connexion
    app.post('/login', (req, res) => {
        const { mail, password } = req.body;
        if (!mail || !password) {
            return res.status(400).send('mail and password are required');
        }

        pool.query('SELECT * FROM users WHERE mail = ?', [mail], async (err, results) => {
            if (err) {
                return res.status(500).send(err);
            }

            if (results.length === 0) {
                return res.status(400).send('Incorrect username or password');
            }

            const user = results[0];
            const isPasswordMatch = await bcrypt.compare(password, user.password);
            if (!isPasswordMatch) {
                return res.status(400).send('Incorrect username or password');
            }

            // Générer un jeton JWT
            const token = jwt.sign({ id: user.id, mail: user.mail }, JWT_SECRET, {
                expiresIn: '1h', // Durée de validité du jeton
            });

            res.json({ token });
            console.log(token);
            console.log(user)
        });
    });
    
    // Middleware pour vérifier les jetons JWT
    const authenticateJWT = (req, res, next) => {
        const authHeader = req.headers['authorization'];
    
        if (authHeader) {
            const token = authHeader.split(' ')[1];
    
            jwt.verify(token, JWT_SECRET, (err, user) => {
                if (err) {
                    return res.sendStatus(403);
                }
                req.user = user;
                next();
            });
        } else {
            res.sendStatus(401);
        }
    };

    app.get('/version', (req, res) => {
        const sql = 'SELECT * FROM version ORDER BY date DESC LIMIT 1';
        pool.query(sql, (err, results) => {
            if (err) {
                res.status(500).send(err);
            } else {
                if (results.length > 0) {
                    res.json(results[0]); // Envoie directement le premier (et unique) résultat
                } else {
                    res.status(404).send({ message: 'No version found' });
                }
            }
        });
    });

    // Exemple de route protégée
    app.get('/profile', authenticateJWT, (req, res) => {
        res.json({ message: 'This is your profile', user: req.user });
    });

    app.listen(port, () => {
        console.log(`Worker ${process.pid} running at http://localhost:${port}/`);
    });
}