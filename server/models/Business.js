import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema(
  {
    query: {
      type: String,
      default: '',
      index: true,
      trim: true,
    },
    searchKey: {
      type: String,
      default: '',
      index: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    placeId: {
      type: String,
      default: '',
      trim: true,
    },
    dataId: {
      type: String,
      default: '',
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    hasWebsite: {
      type: Boolean,
      default: false,
    },
    websiteUrl: {
      type: String,
      default: '',
    },
    contactPhone: {
      type: String,
      default: '',
      trim: true,
    },
    latitude: {
      type: Number,
      default: 0,
    },
    longitude: {
      type: Number,
      default: 0,
    },
    industry: {
      type: String,
      required: true,
    },
    websiteQuality: {
      type: String,
      enum: ['none', 'bad', 'good'],
      default: 'none',
    },
    opportunityScore: {
      type: Number,
      default: 0,
    },
    websiteAnalysis: {
      type: String,
      default: '',
    },
    pitchMessage: {
      type: String,
      default: '',
    },
    coordinates: {
      lat: {
        type: Number,
        default: 0,
      },
      lng: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

businessSchema.index({ query: 1, createdAt: -1 });
businessSchema.index({ searchKey: 1, createdAt: -1 });

const Business = mongoose.model('Business', businessSchema);

export default Business;
