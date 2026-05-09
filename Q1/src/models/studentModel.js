const { Schema, model } = require("mongoose");

const StudentSchema = new Schema({
  rollNumber: {
    type: String,
    required: [true, "rollNumber is required"],
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: [true, "name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
  },
  department: {
    type: String,
    required: [true, "department is required"],
    trim: true,
  },
  cgpa: {
    type: Number,
    min: [0.0, "cgpa cannot be less than 0.0"],
    max: [4.0, "cgpa cannot be greater than 4.0"],
  },
  enrollmentYear: {
    type: Number,
    required: [true, "enrollmentYear is required"],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

StudentSchema.index({ rollNumber: 1 }, { unique: true });
StudentSchema.index({ email: 1 }, { unique: true });

const StudentModel = model("Student", StudentSchema);

module.exports = StudentModel;
