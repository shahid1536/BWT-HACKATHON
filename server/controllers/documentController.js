import path from 'path';
import fs from 'fs';
import Document, { calculateDocumentStatus } from '../models/Document.js';
import { uploadDir } from '../middleware/upload.js';

// Helper to safely remove file from disk
const removeFile = (filename) => {
  if (!filename) return;
  const filePath = path.join(uploadDir, filename);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      console.error(`[Storage] Failed to unlink file ${filePath}:`, e.message);
    }
  }
};

// @desc    Upload and create a new document
// @route   POST /api/documents
export const createDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a document file to upload.',
      });
    }

    const { title, category, description, issueDate, expiryDate } = req.body;

    if (!title || !title.trim()) {
      removeFile(req.file.filename);
      return res.status(400).json({
        success: false,
        message: 'Document title is required.',
      });
    }

    if (!category || !category.trim()) {
      removeFile(req.file.filename);
      return res.status(400).json({
        success: false,
        message: 'Category is required.',
      });
    }

    // Date validation
    const parsedIssue = issueDate ? new Date(issueDate) : null;
    const parsedExpiry = expiryDate ? new Date(expiryDate) : null;

    if (parsedIssue && parsedExpiry && parsedExpiry < parsedIssue) {
      removeFile(req.file.filename);
      return res.status(400).json({
        success: false,
        message: 'Expiry date cannot be earlier than issue date.',
      });
    }

    const newDoc = await Document.create({
      userId: req.user._id,
      title: title.trim(),
      category: category.trim(),
      description: description ? description.trim() : '',
      issueDate: parsedIssue,
      expiryDate: parsedExpiry,
      originalFilename: req.file.originalname,
      storedFilename: req.file.filename,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      storageKey: req.file.filename,
    });

    return res.status(201).json({
      success: true,
      message: 'Document uploaded and organized successfully.',
      document: newDoc,
    });
  } catch (err) {
    if (req.file) {
      removeFile(req.file.filename);
    }
    next(err);
  }
};

// @desc    Get all documents for user with search, filter, and sort
// @route   GET /api/documents
export const getDocuments = async (req, res, next) => {
  try {
    const { search, category, status, sortBy, order } = req.query;

    const query = { userId: req.user._id };

    // Search by title, description, or original filename
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { originalFilename: searchRegex },
      ];
    }

    // Filter by Category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by Expiry Status
    if (status && status !== 'all') {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const next7Days = new Date(todayStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      next7Days.setHours(23, 59, 59, 999);
      const next30Days = new Date(todayStart.getTime() + 30 * 24 * 60 * 60 * 1000);
      next30Days.setHours(23, 59, 59, 999);

      if (status === 'expired') {
        query.expiryDate = { $lt: todayStart, $ne: null };
      } else if (status === 'expiring_soon') {
        query.expiryDate = { $gte: todayStart, $lte: next7Days };
      } else if (status === 'expiring_month') {
        query.expiryDate = { $gt: next7Days, $lte: next30Days };
      } else if (status === 'valid') {
        query.expiryDate = { $gt: next30Days };
      } else if (status === 'no_expiry') {
        query.$or = [{ expiryDate: null }, { expiryDate: { $exists: false } }];
      }
    }

    // Sorting
    const sortField = sortBy || 'createdAt';
    const sortDirection = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortField]: sortDirection };

    const documents = await Document.find(query).sort(sortOptions);

    return res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single document by ID
// @route   GET /api/documents/:id
export const getDocumentById = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or access denied.',
      });
    }

    return res.status(200).json({
      success: true,
      document,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update document metadata and optionally replace file
// @route   PUT /api/documents/:id
export const updateDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      if (req.file) removeFile(req.file.filename);
      return res.status(404).json({
        success: false,
        message: 'Document not found or access denied.',
      });
    }

    const { title, category, description, issueDate, expiryDate } = req.body;

    if (title) document.title = title.trim();
    if (category) document.category = category.trim();
    if (description !== undefined) document.description = description ? description.trim() : '';

    if (issueDate !== undefined) {
      document.issueDate = issueDate ? new Date(issueDate) : null;
    }

    if (expiryDate !== undefined) {
      document.expiryDate = expiryDate ? new Date(expiryDate) : null;
    }

    // Validate date sequence if both present
    if (document.issueDate && document.expiryDate && document.expiryDate < document.issueDate) {
      if (req.file) removeFile(req.file.filename);
      return res.status(400).json({
        success: false,
        message: 'Expiry date cannot be earlier than issue date.',
      });
    }

    // If a replacement file was uploaded
    if (req.file) {
      const oldFilename = document.storedFilename;
      document.originalFilename = req.file.originalname;
      document.storedFilename = req.file.filename;
      document.mimeType = req.file.mimetype;
      document.fileSize = req.file.size;
      document.storageKey = req.file.filename;

      // Safely delete previous file
      removeFile(oldFilename);
    }

    await document.save();

    return res.status(200).json({
      success: true,
      message: 'Document updated successfully.',
      document,
    });
  } catch (err) {
    if (req.file) removeFile(req.file.filename);
    next(err);
  }
};

// @desc    Delete document and its stored physical file
// @route   DELETE /api/documents/:id
export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or access denied.',
      });
    }

    // Delete file from disk
    removeFile(document.storedFilename);

    await document.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Document and attached file deleted permanently.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Download stored document securely
// @route   GET /api/documents/:id/download
export const downloadDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or access denied.',
      });
    }

    const filePath = path.join(uploadDir, document.storedFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'The physical file was not found on the server storage.',
      });
    }

    return res.download(filePath, document.originalFilename);
  } catch (err) {
    next(err);
  }
};

// @desc    Preview document inline (for PDF / Images)
// @route   GET /api/documents/:id/preview
export const previewDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or access denied.',
      });
    }

    const filePath = path.join(uploadDir, document.storedFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'The physical file was not found on the server storage.',
      });
    }

    res.setHeader('Content-Type', document.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(document.originalFilename)}"`
    );

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
};
