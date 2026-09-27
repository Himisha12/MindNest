import express from 'express';
import {
  getPosts,
  getPostBySlugOrId,
  createPost,
  updatePost,
  deletePost,
  getMyPosts,
  toggleLikePost
} from '../controllers/postController.js';
import {
  getCommentsByPost,
  addComment,
  deleteComment
} from '../controllers/commentController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Post routes
router.get('/', optionalAuth, getPosts);
router.get('/user/me', protect, getMyPosts);
router.get('/:slugOrId', optionalAuth, getPostBySlugOrId);
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

// Like toggle route
router.post('/:id/like', protect, toggleLikePost);

// Comment sub-routes
router.get('/:postId/comments', optionalAuth, getCommentsByPost);
router.post('/:postId/comments', protect, addComment);
router.delete('/:postId/comments/:commentId', protect, deleteComment);

export default router;
