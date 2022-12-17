const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    expixy: { type: Date, required: true },
    discount: { type: Number, required: true },
    amount: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);
