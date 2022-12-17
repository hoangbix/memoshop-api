const mongoose = require('mongoose');

const prodCategorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProdCategory', prodCategorySchema);
