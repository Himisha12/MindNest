import AuditLog from '../models/AuditLog.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { exportToCSV } from '../utils/exporter.js';

// @desc    Get system health, performance metrics & telemetry (Observability)
// @route   GET /api/showcase/metrics
// @access  Public
export const getSystemMetrics = async (req, res, next) => {
  try {
    const memoryUsage = process.memoryUsage();
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    const publishedPosts = await Post.countDocuments({ status: 'published' });
    const draftPosts = await Post.countDocuments({ status: 'draft' });
    const totalLogs = await AuditLog.countDocuments();

    res.json({
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      memory: {
        rssMB: (memoryUsage.rss / (1024 * 1024)).toFixed(2),
        heapTotalMB: (memoryUsage.heapTotal / (1024 * 1024)).toFixed(2),
        heapUsedMB: (memoryUsage.heapUsed / (1024 * 1024)).toFixed(2)
      },
      stats: {
        totalUsers,
        totalPosts,
        publishedPosts,
        draftPosts,
        totalAuditLogs: totalLogs
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system audit logs
// @route   GET /api/showcase/audit-logs
// @access  Public
export const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

// @desc    Export published posts data to CSV or JSON
// @route   GET /api/showcase/export
// @access  Public
export const exportPostsData = async (req, res, next) => {
  try {
    const format = (req.query.format || 'csv').toLowerCase();
    const posts = await Post.find({ status: 'published' })
      .populate('author', 'name username email')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      const csvData = exportToCSV(posts);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="mindnest_posts_export.csv"');
      return res.status(200).send(csvData);
    }

    res.json(posts);
  } catch (error) {
    next(error);
  }
};

// @desc    Get System Architecture Specifications & Capability Matrix
// @route   GET /api/showcase/curriculum
// @access  Public
export const getCurriculumMap = (req, res) => {
  res.json({
    platform: 'MindNest Engineering & Publishing Platform',
    architecture: 'Production-Grade Client-Server & MVC Architecture',
    layers: [
      {
        layer: 1,
        title: 'Engineering Foundations & Environment Setup',
        topics: [
          'SDLC Principles', 'Git & Branching Workflows', 'Package Managers (npm)',
          'Environment Variables (.env)', 'Modular File Architecture',
          'Client-Server Partitioning', 'HTTP Request/Response Latency Tracking'
        ],
        implementationInMindNest: 'Decoupled Vite React client + Express Node server, dotenv secret management, modular layout, latency logging headers.'
      },
      {
        layer: 2,
        title: 'Backend Architecture & MVC Design Pattern',
        topics: [
          'MVC Architecture', 'Models (User, Post, Comment, AuditLog)', 'Controllers & Routers',
          'REST API Principles', 'Standard HTTP Verbs & Status Codes', 'Path/Query Params',
          'Pagination, Filtering & Sorting'
        ],
        implementationInMindNest: 'Strict MVC folder structure, RESTful endpoints with query filters, pagination, sorted collections, and clean JSON payloads.'
      },
      {
        layer: 3,
        title: 'Authentication, Authorization & Security',
        topics: [
          'Bcrypt Password Hashing', 'Stateless JWT Tokens', 'HTTP-Only Cookies',
          'Resource Ownership Checks', 'Middleware Guards', 'CORS Security Controls'
        ],
        implementationInMindNest: 'Stateless JWT auth in HTTP-only cookies, bcrypt salt/hashing, resource ownership validation, and CORS origin policy.'
      },
      {
        layer: 4,
        title: 'Data Handling, Exporting & Database Performance',
        topics: [
          'CSV & JSON Data Exporters', 'Input Validation', 'Mongoose Compound & Text Indexes',
          'N+1 Query Prevention', 'Payload Optimization'
        ],
        implementationInMindNest: 'Mongoose text/compound indexes on slug and tags, N+1 query prevention via single-query populate, CSV/JSON dataset export.'
      },
      {
        layer: 5,
        title: 'Role-Based Access Control (RBAC) & Observability',
        topics: [
          'Roles (Reader, Author, Admin)', 'RBAC Guards', 'Permission-Based UI Rendering',
          'Security Audit Logs', 'Docker & Docker Compose', 'Telemetry Endpoints'
        ],
        implementationInMindNest: 'RBAC guard middleware (authorize), immutable AuditLog collection tracking actions, dockerized container setup, and live telemetry endpoints.'
      }
    ]
  });
};
