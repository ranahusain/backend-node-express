const express = require("express");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { body, param, validationResult } = require("express-validator");
const User = require("../models/userModel");

const router = express.Router();

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res
      .status(400)
      .json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    return false;
  }
  return true;
};

const idValidation = [
  param("id").custom((id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user id");
    }
    return true;
  }),
];

router.post(
  "/register",
  [
    body("username").trim().notEmpty().withMessage("username is required"),
    body("email").trim().isEmail().withMessage("valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("password must be at least 6 characters"),
  ],
  async (req, res) => {
    if (!validate(req, res)) return;

    try {
      const { username, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        username,
        email,
        password: hashedPassword,
      });

      const safeUser = user.toObject();
      delete safeUser.password;

      res.status(201).json({ success: true, data: safeUser });
    } catch (error) {
      if (error && error.code === 11000) {
        return res
          .status(409)
          .json({
            success: false,
            message: "username or email already exists",
          });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/:id", idValidation, async (req, res) => {
  if (!validate(req, res)) return;

  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate({
        path: "posts",
        options: { sort: { createdAt: -1 } },
      });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
