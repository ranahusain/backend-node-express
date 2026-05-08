const express = require("express");
const router = express.Router();

const Student = require("../models/studentModel");

// GET /api/students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/students
router.post("/", async (req, res) => {
  try {
    const { name, age, weight } = req.body;
    const newStudent = new Student({ name, age, weight });
    await newStudent.save();
    res.status(201).json({ success: true, student: newStudent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/students/:id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, age, weight } = req.body;
  try {
    const updated = await Student.findByIdAndUpdate(
      id,
      { name, age, weight },
      { new: true },
    );
    if (!updated) return res.status(404).json({ message: "Student not found" });
    res.status(200).json({ success: true, student: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/students/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Student.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Student not found" });
    res.status(200).json({ success: true, student: deleted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
