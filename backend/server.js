const express = require('express');
const app = express();

app.set('view engine', 'ejs');

app.use(express.static('frontend'));

app.get("/", (req, res) => {
    res.render("index");
});

app.get('/login', (req, res) => {
    res.render('login');
});

const PORT = 3004; 
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'stefan',
    password: 'stefan',
    database: 'taskflow_db'
});

// Export the pool to be used in other modules
module.exports = pool.promise();
