const express = require("express");
const mongoose = require("mongoose");
const { param, validationResult } = require("express-validator");
const Comment = require("../models/commentModel");

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

router.delete(
  "/:id",
  [
    param("id").custom((id) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid comment id");
      }
      return true;
    }),
  ],
  async (req, res) => {
    if (!validate(req, res)) return;

    try {
      const deleted = await Comment.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res
          .status(404)
          .json({ success: false, message: "Comment not found" });
      }

      res.status(200).json({ success: true, data: deleted });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

module.exports = router;
