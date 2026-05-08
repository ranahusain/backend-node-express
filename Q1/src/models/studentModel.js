const { Schema, model } = require("mongoose");

const StudentSchema = new Schema({
  name: {
    type: String,
    required: true,
    maxlength: 50,
  },
  age: {
    type: Number,
    required: true,
  },
  weight: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const StudentModel = model("Student", StudentSchema);

module.exports = StudentModel;
