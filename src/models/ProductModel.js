const mongoose = require('mongoose');

var productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, require: true },
    price: { type: Number, require: true },
    promotionalPrice: { type: Number },
    category: { type: String, required: true },
    brand: { type: String, required: true },
    quantity: { type: Number, require: true },
    sold: { type: Number, default: 0 },
    images: [],
    ratings: [{ star: Number, comment: String, postedby: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }],
    totalratings: { type: Number, default: 0 },
    importWarehouseDate: { type: Date, required: true },
    expirationDate: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
