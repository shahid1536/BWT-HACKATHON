import app from '../server/app.js';
import { assertProductionConfiguration } from '../server/config/security.js';
import { connectDB } from '../server/config/db.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  try {
    assertProductionConfiguration();
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error(`[Vercel API bootstrap] ${error.message}`);
    res.statusCode = error.status || 503;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({
      success: false,
      message: error.status ? error.message : 'API service could not connect to its database.',
    }));
  }
}
