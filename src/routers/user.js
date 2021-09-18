const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const router = new express.Router();
const { sendWelcomeEmail, sendCancelEmail } = require("../emails/account");

// For adding a new user
router.post("/users", async (req, res) => {
  // Create a new task by calling constructor function
  const user = new User(req.body);

  // Save the data into database
  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Login router
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send();
  }
});

// Logout Router
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

// LogoutAll router
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

// For updating a user details
router.patch("/users/me", auth, async (req, res) => {
  // Additional validation
  // If a different key is passed which is not in the database to update

  // Grab the key provided by the client
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "age", "password"];

  // Check if all keys are present or not
  const isValidOperation = updates.every((item) =>
    allowedUpdates.includes(item)
  );

  // If any key is not present then return an error
  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    updates.forEach((item) => (req.user[item] = req.body[item]));
    await req.user.save();
    res.send(req.user);
  } catch (error) {
    // If some error occurs while fetching database
    res.status(400).send(error);
  }
});

// For deleting a user
router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    sendCancelEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (error) {
    // If some server error occurs
    res.status(500).send();
  }
});

module.exports = router;
