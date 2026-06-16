const Blog = require('../models/Blog');
const { Comment } = require('../models/Review');
const Notification = require('../models/Notification');
const { emitToUser } = require('../sockets');

// ── @GET /api/blogs ────────────────────────────────────────────────────────
exports.getBlogs = async (req, res, next) => {
  try {
    const { search, tags, category, featured, author, page = 1, limit = 9 } = req.query;

    const filter = { status: 'published' };
    if (search)   filter.$text = { $search: search };
    if (tags)     filter.tags = { $in: tags.split(',') };
    if (category) filter.category = category;
    if (featured === 'true') filter.isFeatured = true;
    if (author)   filter.author = author;

    const skip = (Number(page) - 1) * Number(limit);
    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .populate('author', 'name avatar')
        .select('-content')
        .sort('-publishedAt')
        .skip(skip)
        .limit(Number(limit)),
      Blog.countDocuments(filter),
    ]);

    res.json({ success: true, blogs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// ── @GET /api/blogs/:slug ──────────────────────────────────────────────────
exports.getBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, status: 'published' })
      .populate('author', 'name avatar bio');
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

    Blog.findByIdAndUpdate(blog._id, { $inc: { viewCount: 1 } }).exec();

    res.json({ success: true, blog });
  } catch (err) {
    next(err);
  }
};

// ── @POST /api/blogs ───────────────────────────────────────────────────────
exports.createBlog = async (req, res, next) => {
  try {
    const blog = await Blog.create({ ...req.body, author: req.user._id });
    res.status(201).json({ success: true, blog });
  } catch (err) {
    next(err);
  }
};

// ── @PUT /api/blogs/:id ────────────────────────────────────────────────────
exports.updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, author: req.user._id });
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found or not owner' });

    Object.assign(blog, req.body);
    await blog.save();
    res.json({ success: true, blog });
  } catch (err) {
    next(err);
  }
};

// ── @DELETE /api/blogs/:id ─────────────────────────────────────────────────
exports.deleteBlog = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, author: req.user._id };
    const blog = await Blog.findOneAndUpdate(filter, { status: 'archived' }, { new: true });
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json({ success: true, message: 'Blog archived' });
  } catch (err) {
    next(err);
  }
};

// ── @POST /api/blogs/:id/like ──────────────────────────────────────────────
exports.toggleLike = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

    const idx = blog.likes.indexOf(req.user._id);
    if (idx > -1) {
      blog.likes.splice(idx, 1);
      blog.likeCount = Math.max(0, blog.likeCount - 1);
    } else {
      blog.likes.push(req.user._id);
      blog.likeCount += 1;

      // Notify author (not self)
      if (blog.author.toString() !== req.user._id.toString()) {
        const notif = await Notification.create({
          user: blog.author,
          type: 'blog_like',
          title: 'New Like',
          message: `${req.user.name} liked your blog "${blog.title}"`,
          link: `/blog/${blog.slug}`,
        });
        emitToUser(blog.author.toString(), 'notification', notif);
      }
    }
    await blog.save({ validateBeforeSave: false });

    res.json({ success: true, liked: idx === -1, likeCount: blog.likeCount });
  } catch (err) {
    next(err);
  }
};

// ── @GET /api/blogs/:id/comments ──────────────────────────────────────────
exports.getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ blog: req.params.id, isDeleted: false, parent: null })
      .populate('author', 'name avatar')
      .sort('-createdAt')
      .limit(50);
    res.json({ success: true, comments });
  } catch (err) {
    next(err);
  }
};

// ── @POST /api/blogs/:id/comments ─────────────────────────────────────────
exports.addComment = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

    const comment = await Comment.create({
      blog: req.params.id,
      author: req.user._id,
      text: req.body.text,
      parent: req.body.parent || null,
    });

    await Blog.findByIdAndUpdate(req.params.id, { $inc: { commentCount: 1 } });
    await comment.populate('author', 'name avatar');

    // Notify blog author
    if (blog.author.toString() !== req.user._id.toString()) {
      const notif = await Notification.create({
        user: blog.author,
        type: 'blog_comment',
        title: 'New Comment',
        message: `${req.user.name} commented on "${blog.title}"`,
        link: `/blog/${blog.slug}`,
      });
      emitToUser(blog.author.toString(), 'notification', notif);
    }

    res.status(201).json({ success: true, comment });
  } catch (err) {
    next(err);
  }
};
