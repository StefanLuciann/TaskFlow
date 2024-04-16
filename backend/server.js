const express = require('express');
const bodyParser = require('body-parser'); // Importă modulul body-parser

const app = express();

app.set('view engine', 'ejs');

app.use(express.static('frontend'));

// Configurează body-parser pentru a parsa corpul cererilor POST
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/index', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    const users = {
      user1: 'password1',
      user2: 'password2'
    };

    if (users[username] && users[username] === password) {
      res.redirect('/index');
    } else {
      res.render('login', { error: 'Invalid username or password.' });
    }
});

app.get('/register', (req, res) => {
    res.render('register');
});

const PORT = 3000; 
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
