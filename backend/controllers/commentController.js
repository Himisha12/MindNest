import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

// @desc    Get comments for a specific post
// @route   GET /api/posts/:postId/comments
// @access  Public
export const getCommentsByPost = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'username name avatar')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    next(error);
  }
};

// @desc    Add a comment to a post
// @route   POST /api/posts/:postId/comments
// @access  Private (Logged-in users)
export const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const { postId } = req.params;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment text cannot be empty' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = await Comment.create({
      post: postId,
      author: req.user._id,
      content: content.trim()
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      'author',
      'username name avatar'
    );

    res.status(201).json(populatedComment);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/posts/:postId/comments/:commentId
// @access  Private (Comment author or Post owner)
export const deleteComment = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const post = await Post.findById(postId);

    const isCommentAuthor = comment.author.toString() === req.user._id.toString();
    const isPostOwner = post && post.author.toString() === req.user._id.toString();

    if (!isCommentAuthor && !isPostOwner) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await Comment.findByIdAndDelete(commentId);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
};
