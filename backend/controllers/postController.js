import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import AuditLog from '../models/AuditLog.js';

// Helper to generate unique URL slug
const createSlug = (title) => {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${baseSlug}-${randomSuffix}`;
};

// @desc    Get public published posts (with search, tag filter, pagination)
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, tag, author, sort } = req.query;

    const filter = { status: 'published' };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }

    if (tag) {
      filter.tags = tag.toLowerCase().trim();
    }

    if (author) {
      filter.author = author;
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'popular') {
      sortOptions = { views: -1, createdAt: -1 };
    } else if (sort === 'likes') {
      sortOptions = { likes: -1, createdAt: -1 };
    }

    const total = await Post.countDocuments(filter);
    const posts = await Post.find(filter)
      .populate('author', 'username name avatar bio role')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    res.json({
      posts,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post by slug or ID
// @route   GET /api/posts/:slugOrId
// @access  Public
export const getPostBySlugOrId = async (req, res, next) => {
  try {
    const { slugOrId } = req.params;

    let query = { slug: slugOrId };
    if (slugOrId.match(/^[0-9a-fA-F]{24}$/)) {
      query = { $or: [{ _id: slugOrId }, { slug: slugOrId }] };
    }

    let post = await Post.findOne(query).populate('author', 'username name avatar bio role');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Only author or admin can view draft posts
    if (post.status === 'draft') {
      const isOwner = req.user && req.user._id.toString() === post.author._id.toString();
      const isAdmin = req.user && req.user.role === 'admin';
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: 'This draft post is private to the author' });
      }
    } else {
      // Unique view tracking per user or IP session
      const rawIp = req.headers['x-forwarded-for'] || req.ip || req.socket?.remoteAddress || 'guest';
      const ip = String(rawIp).split(',')[0].trim();
      const viewerId = req.user ? `user:${req.user._id}` : `ip:${ip}`;

      if (!post.viewers) {
        post.viewers = [];
      }

      const hasViewed = post.viewers.includes(viewerId);

      if (!hasViewed) {
        const updatedPost = await Post.findByIdAndUpdate(
          post._id,
          {
            $addToSet: { viewers: viewerId },
            $inc: { views: 1 }
          },
          { new: true }
        ).populate('author', 'username name avatar bio role');

        if (updatedPost) {
          post = updatedPost;
        }
      }
    }

    res.json(post);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new blog post
// @route   POST /api/posts
// @access  Private (Authenticated users with author/admin role)
export const createPost = async (req, res, next) => {
  try {
    const { title, content, excerpt, coverImage, status, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const slug = createSlug(title);
    
    // Auto-generate excerpt if not provided
    const autoExcerpt = excerpt || content.replace(/[^a-zA-Z0-9\s]/g, '').slice(0, 150) + '...';

    const parsedTags = Array.isArray(tags)
      ? tags.map(t => t.toLowerCase().trim()).filter(Boolean)
      : typeof tags === 'string'
      ? tags.split(',').map(t => t.toLowerCase().trim()).filter(Boolean)
      : [];

    const post = await Post.create({
      title,
      slug,
      content,
      excerpt: autoExcerpt,
      coverImage: coverImage || '',
      status: status === 'draft' ? 'draft' : 'published',
      tags: parsedTags,
      author: req.user._id
    });

    // Audit Log Entry
    await AuditLog.create({
      action: 'POST_CREATE',
      user: req.user._id,
      username: req.user.username,
      ip: req.ip || req.socket.remoteAddress,
      details: `Created post "${title}" [Status: ${post.status}]`
    });

    const populatedPost = await Post.findById(post._id).populate('author', 'username name avatar bio role');

    res.status(201).json(populatedPost);
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing blog post
// @route   PUT /api/posts/:id
// @access  Private (Post author or admin)
export const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    const { title, content, excerpt, coverImage, status, tags } = req.body;

    if (title && title !== post.title) {
      post.title = title;
      post.slug = createSlug(title);
    }

    if (content) post.content = content;
    if (excerpt !== undefined) post.excerpt = excerpt;
    if (coverImage !== undefined) post.coverImage = coverImage;
    if (status) post.status = status;

    if (tags !== undefined) {
      post.tags = Array.isArray(tags)
        ? tags.map(t => t.toLowerCase().trim()).filter(Boolean)
        : typeof tags === 'string'
        ? tags.split(',').map(t => t.toLowerCase().trim()).filter(Boolean)
        : [];
    }

    await post.save();

    const updatedPost = await Post.findById(post._id).populate('author', 'username name avatar bio role');
    res.json(updatedPost);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a blog post
// @route   DELETE /api/posts/:id
// @access  Private (Post author or admin)
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Audit Log Entry
    await AuditLog.create({
      action: 'POST_DELETE',
      user: req.user._id,
      username: req.user.username,
      ip: req.ip || req.socket.remoteAddress,
      details: `Deleted post "${post.title}" [ID: ${post._id}]`
    });

    // Delete associated comments
    await Comment.deleteMany({ post: post._id });
    await Post.findByIdAndDelete(post._id);

    res.json({ message: 'Post and associated comments removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's posts (both drafts and published)
// @route   GET /api/posts/user/me
// @access  Private
export const getMyPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ author: req.user._id })
      .populate('author', 'username name avatar role')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle like / unlike on a post
// @route   POST /api/posts/:id/like
// @access  Private
export const toggleLikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id;
    const isLiked = post.likes.some(id => id.toString() === userId.toString());

    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      liked: !isLiked,
      likesCount: post.likes.length,
      likes: post.likes
    });
  } catch (error) {
    next(error);
  }
};

