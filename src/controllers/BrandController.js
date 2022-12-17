const asyncHandler = require('express-async-handler');
const slugify = require('slugify');

const Brand = require('../models/BrandModel');

const createBrand = asyncHandler(async (req, res) => {
  try {
    req.body.slug = slugify(req.body.title);
    const brand = await Brand.create(req.body);
    res.json(brand);
  } catch (error) {
    throw new Error(error.message);
  }
});

const getAllBrand = asyncHandler(async (req, res) => {
  try {
    const brands = await Brand.find();
    res.json(brands);
  } catch (error) {
    throw new Error(error.message);
  }
});

const updateBrand = asyncHandler(async (req, res) => {
  try {
    req.body.slug = slugify(req.body.title);
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!brand) throw new Error('Brand not found');

    res.json(brand);
  } catch (error) {
    throw new Error(error.message);
  }
});

const deleteBrand = asyncHandler(async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) throw new Error('Brand not found');

    res.json({ success: true, message: 'Brand deleted successfully' });
  } catch (error) {
    throw new Error(error.message);
  }
});

module.exports = {
  createBrand,
  getAllBrand,
  updateBrand,
  deleteBrand,
};
