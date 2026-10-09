import Document from '../models/Document.js';
import Category from '../models/Category.js';

// @desc    Get dashboard metrics (Total, Expiring Soon, Expired, Categories Used)
// @route   GET /api/dashboard/stats
export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const next7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    next7Days.setHours(23, 59, 59, 999);

    const [totalDocs, expiringSoonCount, expiredCount, distinctCategories] = await Promise.all([
      Document.countDocuments({ userId }),
      Document.countDocuments({
        userId,
        expiryDate: { $gte: today, $lte: next7Days },
      }),
      Document.countDocuments({
        userId,
        expiryDate: { $lt: today, $ne: null },
      }),
      Document.distinct('category', { userId }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalDocuments: totalDocs,
        expiringSoon: expiringSoonCount,
        expiredDocuments: expiredCount,
        categoriesUsed: distinctCategories.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get recently added documents for user
// @route   GET /api/dashboard/recent-documents
export const getRecentDocuments = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const recentDocs = await Document.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      documents: recentDocs,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get documents approaching expiry and category summary
// @route   GET /api/dashboard/expiry
export const getDashboardExpiryAndSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    next30Days.setHours(23, 59, 59, 999);

    // Fetch documents expiring soon or already expired for quick attention
    const urgentDocs = await Document.find({
      userId,
      expiryDate: { $lte: next30Days, $ne: null },
    })
      .sort({ expiryDate: 1 })
      .limit(6);

    // Calculate category distribution
    const categoryDistribution = await Document.aggregate([
      { $match: { userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      approachingExpiry: urgentDocs,
      categorySummary: categoryDistribution.map((c) => ({
        category: c._id,
        count: c.count,
      })),
    });
  } catch (err) {
    next(err);
  }
};
