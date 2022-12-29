const asyncHandler = require('express-async-handler');
const slugify = require('slugify');

const ProdCategory = require('../models/ProdCategoryModel');

const createProdCategory = asyncHandler(async (req, res) => {
  try {
    const checkCategory = await ProdCategory.findOne({ title: req.body.title });
    if (checkCategory) throw new Error(`Danh mục "${req.body.title}" đã tồn tại`);

    req.body.slug = slugify(req.body.title);
    const category = await ProdCategory.create(req.body);
    res.json(category);
  } catch (error) {
    throw new Error(error.message);
  }
});

const getAllProdCategory = asyncHandler(async (req, res) => {
  try {
    const categories = await ProdCategory.find();
    res.json(categories);
  } catch (error) {
    throw new Error(error.message);
  }
});

const updateProdCategory = asyncHandler(async (req, res) => {
  try {
    req.body.slug = slugify(req.body.title);
    const category = await ProdCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) throw new Error('Category not found');

    res.json(category);
  } catch (error) {
    throw new Error(error.message);
  }
});

const deleteProdCategory = asyncHandler(async (req, res) => {
  try {
    const category = await ProdCategory.findByIdAndDelete(req.params.id);
    if (!category) throw new Error('Category not found');

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    throw new Error(error.message);
  }
});

module.exports = {
  createProdCategory,
  getAllProdCategory,
  updateProdCategory,
  deleteProdCategory,
};
