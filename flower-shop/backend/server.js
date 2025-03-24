const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Отримати всі товари
app.get('/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Помилка сервера');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Сервер запущено на порту ${PORT}`);
});
