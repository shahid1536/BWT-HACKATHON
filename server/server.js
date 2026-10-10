import dotenv from 'dotenv';
import { connectDB, closeDB } from './config/db.js';
import { fileURLToPath } from 'url';
import { assertProductionConfiguration } from './config/security.js';

// Resolve server/.env independently of the directory used to start this script.
dotenv.config({ path: fileURLToPath(new URL('./.env', import.meta.url)) });
const PORT = process.env.PORT || 5000;

assertProductionConfiguration();
await connectDB();
const { default: app } = await import('./app.js');

const server = app.listen(PORT, () => {
  console.log(`[Server] DocuKeep API running on http://localhost:${PORT}`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log('\n[Server] Shutting down gracefully...');
  server.close(async () => {
    await closeDB();
    console.log('[Server] Connections closed. Exiting process.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export default app;
