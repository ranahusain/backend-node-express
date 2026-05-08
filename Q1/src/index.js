const express = require("express");
const app = express();
const connectDB = require("./db");
const students = require("./routes/students");
const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.PORT || 5001;

app.use(express.json());

connectDB();

app.use("/api/students", students);

app.get("/", (req, res) => {
  console.log("I am inside home page route handler");
  res.send("Hello Jee, Welcome to CodeHelp");
});

app.listen(PORT, () => {
  console.log("Server is Up");
});
