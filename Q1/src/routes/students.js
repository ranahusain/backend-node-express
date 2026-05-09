const express = require("express");
const mongoose = require("mongoose");
const { body, param, query, validationResult } = require("express-validator");
const router = express.Router();

const Student = require("../models/studentModel");

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
    return false;
  }
  return true;
};

const fullStudentValidation = [
  body("rollNumber").trim().notEmpty().withMessage("rollNumber is required"),
  body("name").trim().notEmpty().withMessage("name is required"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("email must be valid"),
  body("department").trim().notEmpty().withMessage("department is required"),
  body("cgpa")
    .optional()
    .isFloat({ min: 0.0, max: 4.0 })
    .withMessage("cgpa must be between 0.0 and 4.0"),
  body("enrollmentYear")
    .notEmpty()
    .withMessage("enrollmentYear is required")
    .isInt({ min: 1900, max: 3000 })
    .withMessage("enrollmentYear must be a valid year"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

const partialStudentValidation = [
  body("rollNumber")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("rollNumber cannot be empty"),
  body("name").optional().trim().notEmpty().withMessage("name cannot be empty"),
  body("email").optional().isEmail().withMessage("email must be valid"),
  body("department")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("department cannot be empty"),
  body("cgpa")
    .optional()
    .isFloat({ min: 0.0, max: 4.0 })
    .withMessage("cgpa must be between 0.0 and 4.0"),
  body("enrollmentYear")
    .optional()
    .isInt({ min: 1900, max: 3000 })
    .withMessage("enrollmentYear must be a valid year"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

const idValidation = [
  param("id").custom((id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid student id");
    }
    return true;
  }),
];

// GET /api/students
router.get(
  "/",
  [
    query("department").optional().trim(),
    query("page").optional().isInt({ min: 1 }).withMessage("page must be >= 1"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("limit must be between 1 and 100"),
  ],
  async (req, res) => {
    if (!handleValidation(req, res)) return;

    try {
      const { department } = req.query;
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const skip = (page - 1) * limit;

      const filter = {};
      if (department) {
        filter.department = department;
      }

      const [students, total] = await Promise.all([
        Student.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Student.countDocuments(filter),
      ]);

      res.status(200).json({
        success: true,
        data: students,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

// GET /api/students/search?name=...
router.get(
  "/search",
  [
    query("name")
      .trim()
      .notEmpty()
      .withMessage("name query parameter is required"),
  ],
  async (req, res) => {
    if (!handleValidation(req, res)) return;

    try {
      const { name } = req.query;
      const students = await Student.find({
        name: { $regex: name, $options: "i" },
      }).sort({ createdAt: -1 });

      res.status(200).json({ success: true, data: students });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

// GET /api/students/:id
router.get("/:id", idValidation, async (req, res) => {
  if (!handleValidation(req, res)) return;

  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }
    res.status(200).json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/students
router.post("/", fullStudentValidation, async (req, res) => {
  if (!handleValidation(req, res)) return;

  try {
    const newStudent = new Student(req.body);
    await newStudent.save();
    res.status(201).json({ success: true, data: newStudent });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "rollNumber or email already exists",
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/students/:id
router.put(
  "/:id",
  [...idValidation, ...fullStudentValidation],
  async (req, res) => {
    if (!handleValidation(req, res)) return;

    try {
      const updated = await Student.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!updated) {
        return res
          .status(404)
          .json({ success: false, message: "Student not found" });
      }
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      if (err && err.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "rollNumber or email already exists",
        });
      }
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

// PATCH /api/students/:id
router.patch(
  "/:id",
  [...idValidation, ...partialStudentValidation],
  async (req, res) => {
    if (!handleValidation(req, res)) return;

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required for update",
      });
    }

    try {
      const updated = await Student.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!updated) {
        return res
          .status(404)
          .json({ success: false, message: "Student not found" });
      }
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      if (err && err.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "rollNumber or email already exists",
        });
      }
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

// PATCH /api/students/:id/deactivate
router.patch("/:id/deactivate", idValidation, async (req, res) => {
  if (!handleValidation(req, res)) return;

  try {
    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true, runValidators: true },
    );
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/students/:id
router.delete("/:id", idValidation, async (req, res) => {
  if (!handleValidation(req, res)) return;

  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }
    res.status(200).json({ success: true, data: deleted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
