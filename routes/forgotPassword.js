module.exports = (app, User, nodemailer) => {
  app.get('/forgot-password', (req, res) => {
    res.render('forgotPassword');
  });

  app.post('/reset-password', async (req, res) => {
    const { email } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).send('Email address not found.');
      }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'your_email@gmail.com', // Actualizează cu emailul tău
          pass: 'your_password', // Actualizează cu parola ta
        },
      });

      const resetLink = `http://${req.headers.host}/reset/${user._id}`;
      const mailOptions = {
        from: 'your_email@gmail.com',
        to: email,
        subject: 'Reset your password',
        text: `Click on the following link to reset your password: ${resetLink}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).send("Failed to send email.");
        }

        res.send("Password reset email sent.");
      });
    } catch (error) {
      res.status(500).send('Internal server error.');
    }
  });

  app.get('/reset/:id', (req, res) => {
    const userId = req.params.id;
    res.render('resetPassword', { userId });
  });

  app.post('/reset/:id', async (req, res) => {
    const userId = req.params.id;
    const { password } = req.body;

    try {
      const hash = await bcrypt.hash(password, 10);
      await User.findByIdAndUpdate(userId, { password: hash });
      res.send("Password reset successfully.");
    } catch (error) {
      res.status(500).send("Error resetting password.");
    }
  });
};
