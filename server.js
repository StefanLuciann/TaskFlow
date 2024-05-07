const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

// Middleware for parsing requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session and Passport setup
app.use(session({
  secret: 'mySecret', // Secret for session encryption
  resave: false, // Don't resave unchanged sessions
  saveUninitialized: false, // Don't save empty sessions
}));

app.use(passport.initialize());
app.use(passport.session());

// Mongoose and MongoDB setup
mongoose.connect('mongodb://localhost:27017/todolistDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); // Exit if connection fails
  });

// Import models
const User = require('./models/User');
const Task = require('./models/Task');

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

// Middleware to check if a user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next(); // Continue if authenticated
  } else {
    res.redirect('/login'); // Redirect to login if not authenticated
  }
}

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

// Task management routes
app.get('/tasks', isAuthenticated, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }); // Fetch tasks for logged-in user
    res.render('tasks', { tasks }); // Render tasks.ejs with the fetched tasks
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).send('Error fetching tasks.');  
  }
});

app.post('/tasks', isAuthenticated, async (req, res) => {
  const { title } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).send('Task title cannot be empty'); // Validate input
  }

  try {
    const newTask = new Task({
      title,
      userId: req.user._id,
    });

    await newTask.save(); // Save the new task
    res.redirect('/tasks'); // Redirect to tasks after adding a new one
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).send('Error creating task.');
  }
});

// Route for logging out
app.post('/logout', isAuthenticated, (req, res) => {
  req.logout(); // Log out the user
  res.redirect('/login'); // Redirect to login after logging out
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
