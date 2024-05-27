module.exports = (app, User, bcrypt) => {
  app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).render('login', { error: 'Invalid username or password.' });
        }

        req.login(user, (err) => {
            if (err) {
                console.error('Error during login:', err);
                return res.status(500).send('Internal server error.');
            }
            return res.redirect('/tasks');
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal server error.');
    }
});

  app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) {
        return res.status(500).send('Internal server error.');
      }

      try {
        const newUser = new User({ username, email, password: hash });
        await newUser.save();
        res.redirect('/login'); // Redirect after successful registration
      } catch (error) {
        if (error.code === 11000) {
          return res.status(400).render('register', { error: 'Username or email already exists.' });
        }
        return res.status(500).send('Internal server error.');
      }
    });
  });
};
