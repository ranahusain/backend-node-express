const express = require("express");
const mongoose = require("mongoose");
const { body, param, validationResult } = require("express-validator");
const Post = require("../models/postModel");
const User = require("../models/userModel");
const Comment = require("../models/commentModel");

const router = express.Router();

const validate = (req, res) => {
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

const objectId = (field, label) =>
  param(field).custom((id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error(`Invalid ${label} id`);
    }
    return true;
  });

router.post(
  "/",
  [
    body("title").trim().notEmpty().withMessage("title is required"),
    body("content").trim().notEmpty().withMessage("content is required"),
    body("author").notEmpty().withMessage("author is required"),
    body("author").custom((id) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid author id");
      }
      return true;
    }),
    body("tags").optional().isArray().withMessage("tags must be an array"),
  ],
  async (req, res) => {
    if (!validate(req, res)) return;

    try {
      const { title, content, author, tags = [] } = req.body;
      const existingUser = await User.findById(author);
      if (!existingUser) {
        return res
          .status(404)
          .json({ success: false, message: "Author not found" });
      }

      const post = await Post.create({ title, content, author, tags });
      const populated = await Post.findById(post._id).populate(
        "author",
        "username email",
      );

      res.status(201).json({ success: true, data: populated });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/tag/:tag", async (req, res) => {
  try {
    const posts = await Post.find({ tags: req.params.tag.toLowerCase() })
      .populate("author", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/:id", [objectId("id", "post")], async (req, res) => {
  if (!validate(req, res)) return;

  try {
    const post = await Post.findById(req.params.id).populate([
      {
        path: "author",
        select: "username email",
      },
      {
        path: "comments",
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "user",
          select: "username email",
        },
      },
    ]);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put(
  "/:id",
  [
    objectId("id", "post"),
    body("title")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("title cannot be empty"),
    body("content")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("content cannot be empty"),
    body("tags").optional().isArray().withMessage("tags must be an array"),
  ],
  async (req, res) => {
    if (!validate(req, res)) return;

    if (Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "At least one field is required" });
    }

    try {
      const updated = await Post.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      }).populate("author", "username email");

      if (!updated) {
        return res
          .status(404)
          .json({ success: false, message: "Post not found" });
      }

      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

router.delete("/:id", [objectId("id", "post")], async (req, res) => {
  if (!validate(req, res)) return;

  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    await Comment.deleteMany({ post: req.params.id });

    res
      .status(200)
      .json({ success: true, message: "Post and related comments deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post(
  "/:postId/comments",
  [
    objectId("postId", "post"),
    body("text").trim().notEmpty().withMessage("text is required"),
    body("user").notEmpty().withMessage("user is required"),
    body("user").custom((id) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid user id");
      }
      return true;
    }),
  ],
  async (req, res) => {
    if (!validate(req, res)) return;

    try {
      const post = await Post.findById(req.params.postId);
      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: "Post not found" });
      }

      const user = await User.findById(req.body.user);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const comment = await Comment.create({
        text: req.body.text,
        post: req.params.postId,
        user: req.body.user,
      });

      const populated = await Comment.findById(comment._id).populate(
        "user",
        "username email",
      );

      res.status(201).json({ success: true, data: populated });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

router.get(
  "/:postId/comments",
  [objectId("postId", "post")],
  async (req, res) => {
    if (!validate(req, res)) return;

    try {
      const post = await Post.findById(req.params.postId);
      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: "Post not found" });
      }

      const comments = await Comment.find({ post: req.params.postId })
        .populate("user", "username email")
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, data: comments });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

module.exports = router;
