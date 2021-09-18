const express = require("express");

// Connecting to the database
require("./db/mongoose");

const userRouter = require("./routers/user");
const expenseRouter = require("./routers/expense");

// Create the server
const app = express();

// Set the port on which the server will run
const port = process.env.PORT;

// this helps us to automatically parse the data which was
// send to this server and get the data in "req" down below
app.use(express.json());

// Uses the router files
app.use(userRouter);
app.use(expenseRouter);

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
