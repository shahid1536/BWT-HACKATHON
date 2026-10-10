const DEVELOPMENT_JWT_SECRET = 'docukeep_dev_secret_key_2026';

export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') {
    if (!secret || secret.length < 32) {
      throw new Error('JWT_SECRET must be configured with at least 32 characters in production.');
    }
    return secret;
  }
  return secret || DEVELOPMENT_JWT_SECRET;
};

export const assertProductionConfiguration = () => {
  if (process.env.NODE_ENV !== 'production') return;
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI must be configured before starting DocuKeep in production.');
  }
  getJwtSecret();
};
