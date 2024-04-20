const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt'); // Importăm modulul pentru criptarea parolelor
const nodemailer = require('nodemailer'); // Importăm modulul pentru trimiterea email-urilor

const app = express();

app.set('view engine', 'ejs');

app.use(express.static('frontend'));
app.use(bodyParser.urlencoded({ extended: true }));

// Simulăm o bază de date pentru utilizatori
const users = [];

// Pagina pentru resetarea parolei
app.get('/forgot-password', (req, res) => {
    res.render('forgotPassword');
});

// Funcția pentru generarea unui ID unic pentru utilizatori
const generateUserId = () => {
    return users.length > 0 ? users[users.length - 1].id + 1 : 1;
};

// Funcția pentru găsirea unui utilizator după numele de utilizator
const findUserByUsername = (username) => {
    return users.find(user => user.username === username);
};

// Ruta pentru resetarea parolei
app.post('/reset-password', (req, res) => {
    const { email } = req.body;

    // Verificăm dacă adresa de email există în baza de date
    const user = users.find(user => user.email === email);
    if (!user) {
        return res.status(400).send('Email address not found.'); // Afisează un mesaj de eroare dacă adresa de email nu există
    }

    // Trimitem un email de resetare a parolei
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your_email@gmail.com', // Adresa de email pentru trimiterea email-urilor de resetare a parolei
            pass: 'your_password' // Parola adresei de email
        }
    });

    const mailOptions = {
        from: 'your_email@gmail.com', // Adresa de email de pe care se trimite email-ul
        to: email,
        subject: 'Password Reset',
        text: 'You are receiving this because you (or someone else) requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + user.id + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send('Failed to send password reset email.');
        } else {
            console.log('Email sent: ' + info.response);
            res.send('Password reset email sent.');
        }
    });
});

// Pagina pentru resetarea parolei
app.get('/reset/:id', (req, res) => {
    const userId = req.params.id;
    // Aici poți adăuga logica pentru procesul de resetare a parolei
    res.render('resetPassword', { userId: userId });
});

// Ruta pentru procesarea resetării parolei
app.post('/reset/:id', (req, res) => {
    const userId = req.params.id;
    const newPassword = req.body.password;

    // Aici poți adăuga logica pentru actualizarea parolei utilizatorului cu ID-ul specificat
    res.send('Password reset successfully.');
});

// Pagina pentru login
app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/index', (req, res) => {
  res.render('index'); // Renderează fișierul index.ejs
});

// Ruta pentru procesarea loginului
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Verificăm dacă utilizatorul există în baza de date
    const user = findUserByUsername(username);
    if (!user) {
        return res.status(400).render('login', { error: 'Invalid username or password.' });
    }

    // Verificăm dacă parola este corectă
    bcrypt.compare(password, user.password, (err, result) => {
        if (err || !result) {
            return res.status(400).render('login', { error: 'Invalid username or password.' });
        }
        // Autentificarea este reușită
        res.redirect('/index');
    });
});

// Pagina pentru înregistrare
app.get('/register', (req, res) => {
    res.render('register');
});

// Ruta pentru procesarea înregistrării
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    // Verificăm dacă utilizatorul există deja în baza de date
    if (findUserByUsername(username)) {
        return res.status(400).render('register', { error: 'Username already exists.' });
    }

    // Criptăm parola înainte de a o stoca în baza de date
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            return res.status(500).send('Internal server error.');
        }
        const newUser = {
            id: generateUserId(),
            username: username,
            email: email,
            password: hash // Salvăm parola criptată
        };
        users.push(newUser);
        res.redirect('/login'); // Redirecționăm utilizatorul către pagina de login după înregistrare
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
