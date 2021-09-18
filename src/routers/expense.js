const express = require("express");
const Expense = require("../models/expense");
const auth = require("../middleware/auth");

const router = new express.Router();

// For creating a new expense
router.post("/expenses", auth, async (req, res) => {
  const expense = new Expense({
    ...req.body,
    owner: req.user._id,
  });

  // Save the data into database
  try {
    await expense.save();
    res.status(201).send(expense);
  } catch (error) {
    res.status(400).send(error);
  }
});

// GET /expenses?limit=10&skip=10
// GET /expenses?sortBy=createdAt:desc
// For reading all expenses
router.get("/expenses", auth, async (req, res) => {
  const sort = {};

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }

  try {
    const expenses = await Expense.find({ owner: req.user._id })
      .limit(parseInt(req.query.limit))
      .skip(parseInt(req.query.skip))
      .sort(sort);
    // await req.user.populate("expenses").execPopulate();
    res.send(expenses);
  } catch (error) {
    res.status(500).send();
  }
});

// For reading a single expense
router.get("/expenses/:id", auth, async (req, res) => {
  // By the above method :id we can grab the id passed in the link
  const _id = req.params.id;

  try {
    const expense = await Expense.findOne({ _id, owner: req.user._id });

    // If user is not present
    if (!expense) {
      return res.status(404).send();
    }
    // If user is present
    res.send(expense);
  } catch (error) {
    // If some server error occurs
    res.status(500).send(error);
  }
});

// For updating a expense
router.patch("/expenses/:id", auth, async (req, res) => {
  // Additional validation
  // If a different key is passed which is not in the database to update

  // Grab the key provided by the client
  const updates = Object.keys(req.body);
  const allowedUpdates = ["title", "amount", "date"];

  // Check if all keys are present or not
  const isValidOperation = updates.every((item) =>
    allowedUpdates.includes(item)
  );

  // If any key is not present then return an error
  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    // If user is not found
    if (!expense) {
      return res.status(404).send();
    }

    updates.forEach((item) => (expense[item] = req.body[item]));
    await expense.save();

    // If user is found
    res.send(expense);
  } catch (error) {
    // If some error occurs while fetching database
    res.status(400).send();
  }
});

// For deleting a expense
router.delete("/expenses/:id", auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    // If user is not found
    if (!expense) {
      return res.status(404).send();
    }

    // If user is found
    res.send(expense);
  } catch (error) {
    // If some server error occurs
    res.status(500).send();
  }
});

module.exports = router;
