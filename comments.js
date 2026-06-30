const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');

// GET /api/comments/post/:postId
router.get('/post/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .sort({ createdAt: 1 })
      .populate('author', 'name avatar');
    res.json({ comments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/comments/post/:postId  (auth required)
router.post('/post/:postId', protect, [
  body('text').trim().notEmpty().withMessage('Comment text required').isLength({ max: 1000 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = await Comment.create({
      text: req.body.text,
      author: req.user._id,
      post: req.params.postId,
    });
    await comment.populate('author', 'name avatar');
    res.status(201).json({ comment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/comments/:id  (owner only)
router.put('/:id', protect, [
  body('text').trim().notEmpty().isLength({ max: 1000 }),
], async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    comment.text = req.body.text;
    await comment.save();
    res.json({ comment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/comments/:id  (owner or post-author)
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id).populate('post');
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const isCommentOwner = comment.author.toString() === req.user._id.toString();
    const isPostOwner = comment.post.author.toString() === req.user._id.toString();
    if (!isCommentOwner && !isPostOwner)
      return res.status(403).json({ message: 'Not authorized' });

    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
