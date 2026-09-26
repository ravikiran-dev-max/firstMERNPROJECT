import mongoose from 'mongoose';

const flameEntrySchema = new mongoose.Schema(
  {
    name1: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: 60
    },
    name2: {
      type: String,
      required: [true, 'Second name is required'],
      trim: true,
      maxlength: 60
    },
    resultKey: {
      type: String,
      required: true,
      enum: ['F', 'L', 'A', 'M', 'E', 'S']
    },
    resultName: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: '❤️'
    },
    remainingCount: {
      type: Number,
      required: true,
      min: 0
    },
    matchedLetters: {
      type: [String],
      default: []
    },
    remainingLetters1: {
      type: String,
      default: ''
    },
    remainingLetters2: {
      type: String,
      default: ''
    },
    isPerfectMatch: {
      type: Boolean,
      default: false
    },
    clientInfo: {
      ip: { type: String, default: 'anonymous' },
      userAgent: { type: String, default: 'browser' }
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast sorting and searching in admin panel
flameEntrySchema.index({ createdAt: -1 });
flameEntrySchema.index({ resultKey: 1 });
flameEntrySchema.index({ name1: 'text', name2: 'text' });

const FlameEntry = mongoose.model('FlameEntry', flameEntrySchema);

export default FlameEntry;
