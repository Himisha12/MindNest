# Production Dockerfile for MindNest Platform
FROM node:20-alpine AS build

WORKDIR /app

# Copy root & package manifests
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN cd backend && npm install
RUN cd frontend && npm install

# Copy application files
COPY backend ./backend
COPY frontend ./frontend

# Build frontend
RUN cd frontend && npm run build

EXPOSE 5001

ENV NODE_ENV=production

CMD ["node", "backend/server.js"]
