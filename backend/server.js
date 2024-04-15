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