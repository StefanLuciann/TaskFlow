// app.test.js

const request = require('supertest');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy; // Add this line to import LocalStrategy
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path'); // Add this line to import the path module
const User = require('./models/User');
const Task = require('./models/Task');

// Initialize Express app
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'mySecret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Passport.js configuration for local strategy
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username });

      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Routes
app.set('view engine', 'ejs'); // Use EJS as the templating engine
app.set('views', path.join(__dirname, 'views')); // Define the views directory
app.use(express.static(path.join(__dirname, 'frontend'))); // Serve static files

// Home route
app.get('/', (req, res) => {
  res.render('index'); // Home page with login/register options
});

// Login and register routes
app.get('/login', (req, res) => {
  res.render('login'); // Render login page
});

app.get('/register', (req, res) => {
  res.render('register'); // Render register page
});

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }), // On failure, redirect to login
  (req, res) => {
    res.redirect('/tasks'); // On success, redirect to tasks page
  }
);

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save(); // Save the new user to the database
    res.redirect('/login'); // Redirect to login after successful registration
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).send('Username or email already exists.');
    }

    res.status(500).send('Error registering user.'); // Handle registration errors
  }
});

// Mock bcrypt
jest.mock('bcrypt');

let mongoServer;

describe('User Registration and Login', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await mongoose.connection.db.dropDatabase();
  });

  // Test registration route
  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      bcrypt.hash.mockResolvedValue('hashedPassword123');

      const newUser = {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
      };

      const res = await request(app).post('/register').send(newUser);

      expect(res.statusCode).toBe(302); // Redirect to login
      expect(res.headers.location).toBe('/login');

      const user = await User.findOne({ username: newUser.username });
      expect(user).not.toBeNull();
      expect(user.email).toBe(newUser.email);
      expect(user.password).toBe('hashedPassword123');
    });
  });

  // Test login route
  describe('POST /login', () => {
    it('should login an existing user successfully', async () => {
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);

      await new User({
        username: 'testuser',
        email: 'testuser@example.com',
        password: hashedPassword,
      }).save();

      bcrypt.compare.mockResolvedValue(true);

      const loginData = {
        username: 'testuser',
        password: password,
      };

      const res = await request(app).post('/login').send(loginData);

      expect(res.statusCode).toBe(302); // Redirect to tasks
      expect(res.headers.location).toBe('/tasks');
    });
  });
});
