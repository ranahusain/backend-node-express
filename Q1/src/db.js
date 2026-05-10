const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = async () => {
  try {
    // No connection options are necessary for modern drivers here;
    // `useNewUrlParser` is deprecated and has no effect on recent drivers.
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected");
    return conn;
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
