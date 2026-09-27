import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { seedDatabase } from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../data_db');

if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true });
}

let mongoServer;

export const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (!mongoUri || mongoUri.includes('memory') || mongoUri.includes('localhost')) {
      console.log('Initializing MongoDB Persistent Disk Storage...');
      mongoServer = await MongoMemoryServer.create({
        instance: {
          dbPath: dbPath,
          storageEngine: 'wiredTiger'
        }
      });
      mongoUri = mongoServer.getUri();
      console.log(`Persistent MongoDB database running with dbPath: ${dbPath}`);
    }

    const conn = await mongoose.connect(mongoUri, {
      dbName: process.env.DB_NAME || 'blog_platform'
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Auto-seed sample blog posts on startup if collection is empty
    await seedDatabase();
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    try {
      console.log('Attempting fallback to MongoMemoryServer...');
      mongoServer = await MongoMemoryServer.create({
        instance: {
          dbPath: dbPath,
          storageEngine: 'wiredTiger'
        }
      });
      const fallbackUri = mongoServer.getUri();
      const conn = await mongoose.connect(fallbackUri);
      console.log(`Fallback MongoDB Connected: ${conn.connection.host}`);
      await seedDatabase();
    } catch (fallbackError) {
      console.error(`Fallback failed: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};
