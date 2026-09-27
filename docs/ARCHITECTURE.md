# System Architecture & Technical Specifications — MindNest Platform

## 1. High-Level Architecture Overview

**MindNest** is a production-grade full-stack web application built using the **Client-Server RESTful Architecture & MVC Design Pattern**.

```
+-----------------------------------------------------------------------------------+
|                                    CLIENT TIER                                    |
|   React (Vite) SPA + React Router v6 + Glassmorphism UI + Light/Dark Theme Switch |
|    Markdown Authoring Engine + Developer Portal & Live Telemetry Inspector        |
+----------------------------------------+------------------------------------------+
                                         |
                        REST HTTP / JSON / Cookies / JWT
                                         |
+----------------------------------------v------------------------------------------+
|                                    SERVER TIER                                    |
|                   Node.js + Express.js REST API Architecture                      |
|      - Auth Controller & Middleware (JWT / bcrypt / HTTP-only Cookies)            |
|      - Post Controller (CRUD / Slugs / Drafts / Likes / Pagination / Filtering)   |
|      - Comment Controller (Threaded Discussions & Ownership Guards)               |
|      - User Controller (Public Profiles, Bio Management & RBAC Roles)             |
|      - Showcase & Audit Controller (Telemetry Metrics, CSV Exporter, Audit Logs)  |
+----------------------------------------+------------------------------------------+
                                         |
                                    Mongoose ODM
                                         |
+----------------------------------------v------------------------------------------+
|                                   DATABASE TIER                                   |
|                MongoDB Document Database / MongoMemoryServer Fallback             |
|              Collections: [Users], [Posts], [Comments], [AuditLogs]               |
+-----------------------------------------------------------------------------------+
```

---

## 2. Technical System Layers

| System Layer | Key Concepts | MindNest Physical Implementation |
|---|---|---|
| **Layer 1: Foundations & Setup** | SDLC Principles, Git & Branching, Environment Variables (.env), Modular File Architecture, Latency Tracking | Modular folder layout (`/backend`, `/frontend`, `/docs`), `dotenv` secret management, custom `X-Response-Time` latency logging header middleware. |
| **Layer 2: Backend & MVC Pattern** | MVC Architecture, Models, Controllers, Routes, Separation of Concerns, REST Principles, HTTP Methods & Status Codes | Strict MVC directory structure (`/models`, `/controllers`, `/routes`), query filters (`?search=`, `?tag=`, `?sort=`), paginated query limits, and standardized REST status codes (200, 201, 400, 401, 403, 404, 500). |
| **Layer 3: Auth & Security** | Password Hashing, JWT Tokens, Auth vs Authorization, Tenant Context, Resource Ownership, Middleware Guards, CORS | Stateless JWT auth in HTTP-only cookies, `bcryptjs` password hashing with salt, `protect` & `authorize` middleware guards, resource ownership validation. |
| **Layer 4: Data Handling & Performance** | Data Exporting (CSV/JSON), Validation, Compound & Text Indexes, N+1 Query Prevention, Payload Optimization | Compound Mongoose indexes on `slug`, `author`, `status`, `createdAt`, `.populate()` single-query joins, CSV/JSON dataset export via `/api/showcase/export`. |
| **Layer 5: RBAC & Observability** | Roles (`reader`, `author`, `admin`), RBAC Guards, Audit Logs, Docker / Docker Compose, Health Checks, Metrics Telemetry | RBAC guard middleware (`authorize`), immutable `AuditLog` collection tracking actions, Dockerfile & `docker-compose.yml`, `/api/health` and `/api/showcase/metrics` observability. |

---

## 3. Advanced Platform Capabilities

> 🌟 **Developer Portal & System Telemetry Suite (`/showcase`)**:
> MindNest includes a dedicated **Developer Portal & System Telemetry Suite**:
> 1. **Live System Observability**: Displays node process uptime, heap memory consumption (RSS), in-memory MongoDB connection state, and server response times in real time.
> 2. **Interactive Security Audit Trail**: Displays an immutable security event log (`AuditLog`) capturing registrations, logins, post creations, and RBAC authorization checks.
> 3. **Data Exporter Utility**: Enables readers and authors to export published articles into formatted **CSV** and **JSON** files.
> 4. **Dark / Light Theme Toggle**: Seamless user theme switching with local storage persistence.

---

## 4. Entity Models & Database Schema

### 4.1 User Schema (`User`)
- `username`: String (Unique, Indexed)
- `email`: String (Unique, Indexed)
- `password`: String (Hashed with bcryptjs)
- `name`: String
- `role`: Enum `['reader', 'author', 'admin']` (Default: `'author'`)
- `bio`: String
- `avatar`: String

### 4.2 Post Schema (`Post`)
- `title`: String
- `slug`: String (Unique, Compound Indexed)
- `excerpt`: String
- `content`: String (Raw Markdown)
- `coverImage`: String
- `author`: ObjectId (Ref: `User`)
- `status`: Enum `['draft', 'published']`
- `tags`: Array of Strings (Text Indexed)
- `likes`: Array of ObjectIds (Ref: `User`)
- `views`: Number

### 4.3 AuditLog Schema (`AuditLog`)
- `action`: String (e.g., `'USER_LOGIN_SUCCESS'`, `'POST_CREATE'`, `'POST_DELETE'`)
- `user`: ObjectId (Ref: `User`)
- `username`: String
- `ip`: String
- `details`: String
- `statusCode`: Number
