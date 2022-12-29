const mongoose = require('mongoose');

const prodCategorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true, min: 10, max: 5000 },
    images: [],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProdCategory', prodCategorySchema);
