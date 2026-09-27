import express from 'express';
import {
  getSystemMetrics,
  getAuditLogs,
  exportPostsData,
  getCurriculumMap
} from '../controllers/showcaseController.js';

const router = express.Router();

router.get('/metrics', getSystemMetrics);
router.get('/audit-logs', getAuditLogs);
router.get('/export', exportPostsData);
router.get('/curriculum', getCurriculumMap);

export default router;
