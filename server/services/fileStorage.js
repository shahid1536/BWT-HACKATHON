import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { del, get, head } from '@vercel/blob';
import { uploadDir } from '../middleware/upload.js';

export const usesVercelBlob = () =>
  Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

export const getStoredFileMetadata = async (storageKey) => {
  if (usesVercelBlob()) {
    return head(storageKey, { access: 'private' });
  }

  const root = path.resolve(uploadDir);
  const filePath = path.resolve(root, storageKey);
  if (!filePath.startsWith(`${root}${path.sep}`) || !fs.existsSync(filePath)) {
    return null;
  }
  return { filePath };
};

export const streamStoredFile = async (storageKey) => {
  if (usesVercelBlob()) {
    const result = await get(storageKey, { access: 'private' });
    if (!result || result.statusCode !== 200) return null;
    return {
      stream: Readable.fromWeb(result.stream),
      contentType: result.blob.contentType,
    };
  }

  const metadata = await getStoredFileMetadata(storageKey);
  if (!metadata) return null;
  return { stream: fs.createReadStream(metadata.filePath) };
};

export const removeStoredFile = async (storageKey) => {
  if (!storageKey) return;
  if (usesVercelBlob()) {
    await del(storageKey, { access: 'private' });
    return;
  }

  const root = path.resolve(uploadDir);
  const filePath = path.resolve(root, storageKey);
  if (filePath.startsWith(`${root}${path.sep}`) && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
