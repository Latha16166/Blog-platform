const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { protect, optionalAuth } = require('../middleware/auth');

// GET /api/posts  — paginated feed
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;
    const search = req.query.search || '';
    const tag    = req.query.tag || '';

    const query = {};
    if (search) query.$or = [
      { title:   { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
    ];
    if (tag) query.tags = tag;

    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name avatar')
        .populate('commentCount'),
      Post.countDocuments(query),
    ]);

    res.json({ posts, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/posts/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name avatar bio')
      .populate('commentCount');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/posts  (auth required)
router.post('/', protect, [
  body('title').trim().notEmpty().withMessage('Title required').isLength({ max: 120 }),
  body('content').trim().isLength({ min: 10 }).withMessage('Content must be at least 10 chars'),
  body('tags').optional().isArray(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { title, content, tags, coverImage } = req.body;
    const post = await Post.create({ title, content, tags, coverImage, author: req.user._id });
    await post.populate('author', 'name avatar');
    res.status(201).json({ post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/posts/:id  (owner only)
router.put('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const { title, content, tags, coverImage } = req.body;
    post.title       = title       ?? post.title;
    post.content     = content     ?? post.content;
    post.tags        = tags        ?? post.tags;
    post.coverImage  = coverImage  ?? post.coverImage;
    await post.save();
    await post.populate('author', 'name avatar');
    res.json({ post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/posts/:id  (owner only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    await Promise.all([
      post.deleteOne(),
      Comment.deleteMany({ post: req.params.id }),
    ]);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/posts/:id/like  (toggle)
router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const idx = post.likes.indexOf(req.user._id);
    if (idx === -1) post.likes.push(req.user._id);
    else            post.likes.splice(idx, 1);
    await post.save();
    res.json({ likes: post.likes.length, liked: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
