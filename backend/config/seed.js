import User from '../models/User.js';
import Post from '../models/Post.js';

export const seedDatabase = async () => {
  try {
    const postCount = await Post.countDocuments();
    if (postCount > 0) {
      return; // Already seeded
    }

    console.log('Seeding Admin account and initial blog posts for MindNest...');

    // Create Admin User
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@mindnest.com',
      password: 'admin123',
      name: 'System Admin',
      role: 'admin',
      bio: 'MindNest Platform Administrator & Core Tech Contributor.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isEmailVerified: true
    });

    // Create seed authors
    const author1 = await User.create({
      username: 'sarah_tech',
      email: 'sarah@example.com',
      password: 'password123',
      name: 'Sarah Chen',
      role: 'author',
      bio: 'Senior Full-Stack Engineer writing about React, Node.js, and Modern Web Architecture.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      isEmailVerified: true
    });

    const author2 = await User.create({
      username: 'alex_ai',
      email: 'alex@example.com',
      password: 'password123',
      name: 'Alex Rivera',
      role: 'author',
      bio: 'AI Researcher & UX Designer exploring the intersection of Design Systems and Generative AI.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isEmailVerified: true
    });

    // Create seed blog posts across requested tags: technology, react, nodejs, ai, design, mongodb
    const seedPosts = [
      {
        title: 'Building Modern React Applications with Vite and Server Components',
        slug: 'building-modern-react-applications-with-vite',
        excerpt: 'Discover how modern React tooling, Vite bundling, and component state patterns elevate web development velocity.',
        content: `# Building Modern React Applications with Vite

React has evolved significantly over the past few years. With the transition away from monolithic bundlers towards hyper-fast build tools like **Vite**, developer experience has reached new heights.

## Why Vite Changes Everything
- **Instant Server Cold Start**: Native ES Module serving avoids bundling during development.
- **Lightning Hot Module Replacement (HMR)**: Changes reflect instantaneously regardless of application size.
- **Seamless TypeScript Support**: Zero-configuration transpilation out of the box.

\`\`\`jsx
import React, { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}
\`\`\`

## Key Takeaways
Embracing clean component boundaries and modern hooks allows teams to build scalable React applications effortlessly.`,
        coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
        author: adminUser._id,
        status: 'published',
        tags: ['react', 'technology', 'webdev'],
        likes: [author1._id, author2._id],
        views: 342,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'High-Performance Node.js APIs: Architecture & Scalability Patterns',
        slug: 'high-performance-nodejs-apis-architecture',
        excerpt: 'A comprehensive guide to structuring scalable Express backends, connection pooling, and response optimizations.',
        content: `# High-Performance Node.js APIs

Node.js remains the dominant runtime for server-side Javascript. Building enterprise APIs requires careful attention to asynchronous execution, middleware pipelines, and stateless session management.

## Best Practices for Node.js Backends
1. **Stateless JWT Authorization**: Store session tokens in HTTP-only cookies to eliminate database session lookups.
2. **Asynchronous Non-Blocking I/O**: Leverage event loops without blocking main execution threads.
3. **Structured MVC Architecture**: Keep controllers lightweight by delegating business logic to service layers.

> "A well-architected Node.js backend handles heavy throughput cleanly when event loops remain unblocked."`,
        coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
        author: adminUser._id,
        status: 'published',
        tags: ['nodejs', 'technology', 'backend'],
        likes: [author2._id],
        views: 520,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'The Evolution of Artificial Intelligence in User Experience Design',
        slug: 'evolution-of-ai-in-user-experience-design',
        excerpt: 'How generative AI and machine learning are revolutionizing dynamic user interfaces and design systems.',
        content: `# AI-Driven User Experience Design

Artificial Intelligence is no longer just a backend algorithm; it is transforming how users interact with digital interfaces.

## Dynamic UI Personalization
Modern applications adapt their interfaces in real-time based on user preferences, behavioral telemetry, and predictive intent.

### Core Pillars of AI Design
- **Contextual Awareness**: Anticipating user intent before explicit input.
- **Generative UI Components**: Creating customized layouts tailored to specific user tasks.
- **Glassmorphism & Micro-Animations**: Enhancing visual delight while maintaining high usability.`,
        coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        author: adminUser._id,
        status: 'published',
        tags: ['ai', 'design', 'technology'],
        likes: [author1._id, adminUser._id],
        views: 890,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Mastering MongoDB Schema Design & Compound Index Optimization',
        slug: 'mastering-mongodb-schema-design-indexing',
        excerpt: 'Learn document modeling techniques, compound indexing strategies, and aggregation pipelines in MongoDB.',
        content: `# Mastering MongoDB Indexing & Schema Design

MongoDB's flexible document model makes it the premier choice for modern web applications requiring fast read/write throughput.

## Indexing Strategies for Instant Queries
Without proper indexes, database queries perform costly full-collection scans. Adding compound indexes dramatically accelerates search speeds.

\`\`\`javascript
// Compound index on author, status, and createdAt
postSchema.index({ author: 1, status: 1, createdAt: -1 });

// Text index for full-text search across titles and tags
postSchema.index({ title: 'text', tags: 'text' });
\`\`\`

## Avoiding N+1 Queries
Use single-query population (\`.populate()\`) to join user references in a single operation, keeping payload delivery crisp and efficient.`,
        coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80',
        author: adminUser._id,
        status: 'published',
        tags: ['mongodb', 'technology', 'database'],
        likes: [author1._id, author2._id],
        views: 610,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Designing Beautiful Dark Mode & Glassmorphism UIs with CSS',
        slug: 'designing-beautiful-dark-mode-glassmorphism-css',
        excerpt: 'Crafting visually stunning dark mode interfaces using CSS custom properties, backdrop filters, and HSL palettes.',
        content: `# Designing Modern Glassmorphism Interfaces

Visual design in modern web apps relies on depth, high contrast typography, and subtle light reflections.

## HSL Color Systems & Dark Mode
Using HSL (Hue, Saturation, Lightness) variables allows effortless theme toggling between Light and Dark modes.

\`\`\`css
:root {
  --bg-primary: #0b0f19;
  --bg-card: rgba(17, 24, 39, 0.85);
  --accent-gradient: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
}

[data-theme="light"] {
  --bg-primary: #f8fafc;
  --bg-card: #ffffff;
}
\`\`\`

## Key Visual Rules
- Avoid plain black (\`#000000\`); use deep midnight blues or slates.
- Incorporate subtle border glows and blurred backdrops (\`backdrop-filter: blur(16px)\`).`,
        coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
        author: adminUser._id,
        status: 'published',
        tags: ['design', 'react', 'technology'],
        likes: [author1._id],
        views: 430,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Scalable Database Architectures with MongoDB and Node.js',
        slug: 'scalable-database-architectures-with-mongodb-and-nodejs',
        excerpt: 'Best practices for indexing, connection pooling, and payload optimization in production.',
        content: `# Scalable Database Architectures with MongoDB and Node.js

Designing database architecture for high-throughput web applications requires careful optimization at both the schema and query levels.

## Key Principles for Scalable MongoDB Applications:

1. **Indexing Strategy**: Always create compound indexes for fields involved in frequent sort and filter operations.
2. **Connection Pooling**: Reuse Mongoose connection instances across async request lifecycles.
3. **Payload Reduction**: Project only necessary fields and exclude internal sensitive hashes.

\`\`\`javascript
// Example Mongoose Index Declaration
postSchema.index({ author: 1, status: 1, createdAt: -1 });
\`\`\`

By following these architecture patterns, your database performance remains snappy even as read traffic grows.`,
        coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80',
        author: adminUser._id,
        status: 'published',
        tags: ['mongodb', 'nodejs', 'technology', 'database'],
        likes: [author1._id, author2._id],
        views: 284,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'The Future of Web Development with AI & React',
        slug: 'the-future-of-web-development-with-ai-and-react',
        excerpt: 'Exploring how artificial intelligence tools accelerate modern frontend engineering workflows.',
        content: `# The Future of Web Development with AI & React

Exploring how artificial intelligence tools accelerate modern frontend engineering workflows.

### 1. Intelligent Pair Programming
AI code assistants act as real-time pair programmers, generating component scaffolding, suggesting optimal hook dependencies, and handling repetitive boilerplate code.

### 2. Automated Testing & Accessibility Audits
With intelligent static analysis, frontend engineers can generate unit tests and verify WCAG accessibility compliance automatically.

\`\`\`jsx
import React from 'react';

export default function AssistantWidget() {
  return (
    <div className="ai-widget">
      <h3>AI Pair Assistant Active</h3>
      <p>Helping you write cleaner, faster React code.</p>
    </div>
  );
}
\`\`\`

### Conclusion
By pairing human creativity with AI-assisted velocity, modern web development becomes faster, cleaner, and more enjoyable.`,
        coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        author: adminUser._id,
        status: 'published',
        tags: ['react', 'ai', 'technology', 'webdev'],
        likes: [author1._id, adminUser._id],
        views: 395,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    await Post.insertMany(seedPosts);
    console.log('Admin account and seed blogs inserted successfully!');
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};
