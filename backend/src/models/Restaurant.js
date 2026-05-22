const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    gpsLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    menu: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' }],
    isApproved: { type: Boolean, default: false },
    prepTimeMinutes: { type: Number, default: 30 },
    image: { type: String },
  },
  { timestamps: true }
);

restaurantSchema.index({ gpsLocation: '2dsphere' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
