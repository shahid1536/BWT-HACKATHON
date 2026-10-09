import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    issueDate: {
      type: Date,
      default: null,
    },
    expiryDate: {
      type: Date,
      default: null,
      index: true,
    },
    originalFilename: {
      type: String,
      required: true,
    },
    storedFilename: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    storageKey: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Date consistency validation: If both issueDate and expiryDate are provided, expiryDate must not precede issueDate
documentSchema.pre('validate', function (next) {
  if (this.issueDate && this.expiryDate) {
    const issueTime = new Date(this.issueDate).setHours(0, 0, 0, 0);
    const expiryTime = new Date(this.expiryDate).setHours(0, 0, 0, 0);
    if (expiryTime < issueTime) {
      this.invalidate('expiryDate', 'Expiry date cannot be earlier than issue date');
    }
  }
  next();
});

// Helper function to calculate status and daysRemaining
export const calculateDocumentStatus = (expiryDate) => {
  if (!expiryDate) {
    return { status: 'no_expiry', daysRemaining: null };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const exp = new Date(expiryDate);
  const targetDate = new Date(exp.getFullYear(), exp.getMonth(), exp.getDate());

  const msPerDay = 1000 * 60 * 60 * 24;
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / msPerDay);

  if (diffDays < 0) {
    return { status: 'expired', daysRemaining: diffDays };
  } else if (diffDays <= 7) {
    return { status: 'expiring_soon', daysRemaining: diffDays };
  } else if (diffDays <= 30) {
    return { status: 'expiring_month', daysRemaining: diffDays };
  } else {
    return { status: 'valid', daysRemaining: diffDays };
  }
};

// Virtuals for status and days remaining
documentSchema.virtual('status').get(function () {
  return calculateDocumentStatus(this.expiryDate).status;
});

documentSchema.virtual('daysRemaining').get(function () {
  return calculateDocumentStatus(this.expiryDate).daysRemaining;
});

const Document = mongoose.model('Document', documentSchema);
export default Document;
