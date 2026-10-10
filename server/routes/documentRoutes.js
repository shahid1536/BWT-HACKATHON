import express from 'express';
import {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  downloadDocument,
  previewDocument,
} from '../controllers/documentController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { deleteUploadedBlob, handleDocumentBlobUpload } from '../controllers/blobController.js';

const router = express.Router();

router.post('/blob-upload', handleDocumentBlobUpload);
router.delete('/blob-upload', protect, deleteUploadedBlob);

// Apply auth protection to all document routes
router.use(protect);

router.route('/')
  .post(upload.single('file'), createDocument)
  .get(getDocuments);

router.route('/:id')
  .get(getDocumentById)
  .put(upload.single('file'), updateDocument)
  .delete(deleteDocument);

router.get('/:id/download', downloadDocument);
router.get('/:id/preview', previewDocument);

export default router;
