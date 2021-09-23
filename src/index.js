const express = require("express");

// Connecting to the database
require("./db/mongoose");

const userRouter = require("./routers/user");
const expenseRouter = require("./routers/expense");

// Create the server
const app = express();

// Set the port on which the server will run
const port = process.env.PORT;

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,PATCH");
  next();
});

// this helps us to automatically parse the data which was
// send to this server and get the data in "req" down below
app.use(express.json());

// Uses the router files
app.use(userRouter);
app.use(expenseRouter);

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
