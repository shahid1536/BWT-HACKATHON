import mongoose from 'mongoose';

let mongoMemoryServer = null;
let connectionPromise = null;

const connectDBOnce = async () => {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const primaryUri = process.env.MONGODB_URI || (
    isDevelopment ? 'mongodb://127.0.0.1:27017/docukeep' : null
  );

  if (!primaryUri) {
    throw new Error('MONGODB_URI must be configured before connecting to MongoDB in production.');
  }

  try {
    await mongoose.connect(primaryUri, { serverSelectionTimeoutMS: 10000 });
    console.log('[Database] Connected to the configured MongoDB database.');
  } catch (err) {
    if (!isDevelopment) {
      console.error(`[Database] MongoDB connection failed (${err.name}).`);
      throw new Error('Could not connect to the production MongoDB database.', { cause: err });
    }

    console.warn(`[Database] Local MongoDB unavailable (${err.name}); starting a development-only in-memory database.`);

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(inMemoryUri);
      console.log('[Database] Connected to the development-only in-memory MongoDB database.');
    } catch (memErr) {
      console.error(`[Database] Failed to start development in-memory database (${memErr.name}).`);
      throw memErr;
    }
  }
};

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connectionPromise) return connectionPromise;

  connectionPromise = connectDBOnce();
  try {
    return await connectionPromise;
  } finally {
    connectionPromise = null;
  }
};

export const closeDB = async () => {
  connectionPromise = null;
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
