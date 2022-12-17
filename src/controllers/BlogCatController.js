const asyncHandler = require('express-async-handler');
const slugify = require('slugify');

const BlogCategory = require('../models/BlogCatModel');

const createBlogCategory = asyncHandler(async (req, res) => {
  try {
    req.body.slug = slugify(req.body.title);
    const category = await BlogCategory.create(req.body);
    res.json(category);
  } catch (error) {
    throw new Error(error.message);
  }
});

const getAllBlogCategory = asyncHandler(async (req, res) => {
  try {
    const categories = await BlogCategory.find();
    res.json(categories);
  } catch (error) {
    throw new Error(error.message);
  }
});

const updateBlogCategory = asyncHandler(async (req, res) => {
  try {
    req.body.slug = slugify(req.body.title);
    const category = await BlogCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) throw new Error('Category not found');

    res.json(category);
  } catch (error) {
    throw new Error(error.message);
  }
});

const deleteBlogCategory = asyncHandler(async (req, res) => {
  try {
    const category = await BlogCategory.findByIdAndDelete(req.params.id);
    if (!category) throw new Error('Category not found');

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    throw new Error(error.message);
  }
});

module.exports = {
  createBlogCategory,
  getAllBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
};
