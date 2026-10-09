import Category from '../models/Category.js';
import Document from '../models/Document.js';
import { seedDefaultCategories } from './authController.js';

// @desc    Get all categories for authenticated user with document counts
// @route   GET /api/categories
export const getCategories = async (req, res, next) => {
  try {
    await seedDefaultCategories(req.user._id);

    const categories = await Category.find({ userId: req.user._id }).sort({ name: 1 });

    // Aggregate counts of documents per category
    const docCounts = await Document.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    docCounts.forEach((item) => {
      countMap[item._id] = item.count;
    });

    const categoriesWithCount = categories.map((cat) => ({
      _id: cat._id,
      name: cat.name,
      isDefault: cat.isDefault,
      documentCount: countMap[cat.name] || 0,
      createdAt: cat.createdAt,
    }));

    return res.status(200).json({
      success: true,
      categories: categoriesWithCount,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new custom category
// @route   POST /api/categories
export const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.',
      });
    }

    const trimmedName = name.trim();

    // Check if category exists for user (case-insensitive)
    const existing = await Category.findOne({
      userId: req.user._id,
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name already exists.',
      });
    }

    const category = await Category.create({
      userId: req.user._id,
      name: trimmedName,
      isDefault: false,
    });

    return res.status(201).json({
      success: true,
      category: {
        _id: category._id,
        name: category.name,
        isDefault: category.isDefault,
        documentCount: 0,
        createdAt: category.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a category name
// @route   PUT /api/categories/:id
export const updateCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.',
      });
    }

    const trimmedName = name.trim();
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    const oldName = category.name;

    // Check conflict with other categories
    const duplicate = await Category.findOne({
      userId: req.user._id,
      _id: { $ne: category._id },
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'Another category with this name already exists.',
      });
    }

    category.name = trimmedName;
    await category.save();

    // Also update any documents referencing the old category name
    if (oldName !== trimmedName) {
      await Document.updateMany(
        { userId: req.user._id, category: oldName },
        { $set: { category: trimmedName } }
      );
    }

    const docCount = await Document.countDocuments({
      userId: req.user._id,
      category: trimmedName,
    });

    return res.status(200).json({
      success: true,
      category: {
        _id: category._id,
        name: category.name,
        isDefault: category.isDefault,
        documentCount: docCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    // Check if documents are using this category
    const docCount = await Document.countDocuments({
      userId: req.user._id,
      category: category.name,
    });

    if (docCount > 0) {
      // Reassign to "Other"
      await Document.updateMany(
        { userId: req.user._id, category: category.name },
        { $set: { category: 'Other' } }
      );
    }

    await category.deleteOne();

    return res.status(200).json({
      success: true,
      message: `Category removed.${docCount > 0 ? ` ${docCount} documents were reassigned to 'Other'.` : ''}`,
    });
  } catch (err) {
    next(err);
  }
};
