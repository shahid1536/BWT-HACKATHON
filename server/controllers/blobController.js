import { del, issueSignedToken } from '@vercel/blob';
import { handleUploadPresigned } from '@vercel/blob/client';
import { MAX_FILE_SIZE, ALLOWED_MIME_TYPES } from '../config/constants.js';
import { getAuthenticatedUser } from '../middleware/auth.js';

const requireBlobStore = () => {
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
    throw Object.assign(new Error('Private Vercel Blob storage is not connected to this project.'), {
      status: 503,
    });
  }
};

const userBlobPrefix = (userId) => `documents/${userId}/`;

export const handleDocumentBlobUpload = async (req, res, next) => {
  try {
    requireBlobStore();
    const result = await handleUploadPresigned({
      body: req.body,
      request: req,
      getSignedToken: async (pathname) => {
        const user = await getAuthenticatedUser(req);
        if (!pathname.startsWith(userBlobPrefix(user._id.toString()))) {
          throw Object.assign(new Error('Upload path is not authorized for this account.'), {
            status: 403,
          });
        }

        const token = await issueSignedToken({
          pathname,
          operations: ['put'],
          allowedContentTypes: ALLOWED_MIME_TYPES,
          maximumSizeInBytes: MAX_FILE_SIZE,
          validUntil: Date.now() + 5 * 60 * 1000,
        });

        return {
          token,
          urlOptions: {
            allowOverwrite: false,
            addRandomSuffix: false,
          },
        };
      },
    });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteUploadedBlob = async (req, res, next) => {
  try {
    requireBlobStore();
    const pathname = req.body?.pathname;
    if (
      typeof pathname !== 'string' ||
      !pathname.startsWith(userBlobPrefix(req.user._id.toString()))
    ) {
      return res.status(400).json({
        success: false,
        message: 'A valid uploaded document path is required.',
      });
    }

    await del(pathname, { access: 'private' });
    return res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};
