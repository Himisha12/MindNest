import User from '../models/User.js';
import Post from '../models/Post.js';

// @desc    Get public user profile & published posts by username
// @route   GET /api/users/:username
// @access  Public
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() }).select(
      '-password'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const posts = await Post.find({ author: user._id, status: 'published' })
      .populate('author', 'username name avatar')
      .sort({ createdAt: -1 });

    const totalLikes = posts.reduce((sum, p) => sum + (p.likes ? p.likes.length : 0), 0);
    const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);

    res.json({
      user,
      posts,
      stats: {
        totalPosts: posts.length,
        totalLikes,
        totalViews
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile (bio, name, avatar)
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, bio, avatar } = req.body;

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      name: updatedUser.name,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
      createdAt: updatedUser.createdAt
    });
  } catch (error) {
    next(error);
  }
};
