import mongoose from 'mongoose';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/docukeep';

  try {
    // Attempt connecting to the configured or default local URI first with a 3-second timeout
    await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] Connected to MongoDB at ${primaryUri}`);
  } catch (err) {
    console.warn(`[Database] Could not connect to primary MongoDB (${primaryUri}): ${err.message}`);
    console.log('[Database] Starting in-memory MongoDB instance for local seamless development...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`[Database] Successfully connected to in-memory MongoDB at ${inMemoryUri}`);
    } catch (memErr) {
      console.error('[Database] Fatal: Failed to start in-memory database:', memErr.message);
      throw memErr;
    }
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
