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

const router = express.Router();

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
