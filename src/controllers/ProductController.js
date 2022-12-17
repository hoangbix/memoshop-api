const asyncHandler = require('express-async-handler');
const slugify = require('slugify');
const fs = require('fs');

const Product = require('../models/ProductModel');
const User = require('../models/UserModel');
const cloudinaryUploadImg = require('../utils/cloudinary');

/******** CREATE PRODUCT *******/
const createProduct = asyncHandler(async (req, res) => {
  try {
    req.body.slug = slugify(req.body.title);

    const newProduct = await Product.create(req.body);

    res.json(newProduct);
  } catch (error) {
    throw new Error(error.message);
  }
});

/******** GET & SEARCH ALL PRODUCT *******/
const getAllProduct = asyncHandler(async (req, res) => {
  try {
    /********* Filtering ********/
    const queryObj = { ...req.query };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((field) => delete queryObj[field]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Product.find(JSON.parse(queryStr));

    /********* Sorting ********/
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    /********* Limiting the fields ********/
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    /********* Pagination ********/
    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) throw new Error('This page does not exists');
    }

    const products = await query;
    res.json(products);
  } catch (error) {
    throw new Error(error.message);
  }
});

/******** GET PRODUCT BY SLUG *******/
const getProductById = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) throw new Error('Product not found');

    res.json(product);
  } catch (error) {
    throw new Error(error.message);
  }
});

/******** GET PRODUCT BY ID *******/
const getProductBySlug = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });

    if (!product) throw new Error('Product not found');

    res.json(product);
  } catch (error) {
    throw new Error(error.message);
  }
});

/******** UPDATE PRODUCT *******/
const updateProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) req.body.slug = slugify(req.body.title);

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProduct) throw new Error('Product not found');

    res.json(updatedProduct);
  } catch (error) {
    throw new Error(error.message);
  }
});

/******** DELETE PRODUCT *******/
const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) throw new Error('Product not found');

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    throw new Error(error.message);
  }
});

/******** ADD TO WISHLIST *******/
const addToWishList = asyncHandler(async (req, res) => {
  try {
    const { id } = req.user;
    const { prodId } = req.body;
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');

    const alreadyAdded = await user.wishlist.find((id) => id.toString() === prodId);

    if (alreadyAdded) {
      const user = await User.findByIdAndUpdate(id, { $pull: { wishlist: prodId } }, { new: true }).select('-password');
      res.json(user);
    } else {
      const user = await User.findByIdAndUpdate(id, { $push: { wishlist: prodId } }, { new: true }).select('-password');
      res.json(user);
    }
  } catch (error) {
    throw new Error(error.message);
  }
});

const rating = asyncHandler(async (req, res) => {
  try {
    const { id } = req.user;
    const { star, comment, prodId } = req.body;
    const product = await Product.findById(prodId);
    if (!product) throw new Error('Product not found');

    let alreadyRated = product.ratings.find((userId) => userId.postedby.toString() === id.toString());

    if (alreadyRated) {
      await Product.updateOne(
        { ratings: { $elemMatch: alreadyRated } },
        { $set: { 'ratings.$.star': star, 'ratings.$.comment': comment } },
        { new: true }
      );
    } else {
      await Product.findByIdAndUpdate(
        prodId,
        {
          $push: {
            ratings: {
              star: star,
              comment: comment,
              postedby: id,
            },
          },
        },
        { new: true }
      );
    }

    const getAllRating = await Product.findById(prodId);
    if (!getAllRating) throw new Error('Product not found');

    let totalRating = getAllRating.ratings.length;
    let ratingSum = getAllRating.ratings.map((item) => item.star).reduce((prev, curr) => prev + curr, 0);
    let actualRating = Math.round(ratingSum / totalRating);

    const finaProduct = await Product.findByIdAndUpdate(prodId, { totalratings: actualRating }, { new: true });
    res.json(finaProduct);
  } catch (error) {
    throw new Error(error.message);
  }
});

const uploadImages = asyncHandler(async (req, res) => {
  try {
    const uploader = (path) => cloudinaryUploadImg(path, 'images');
    const urls = [];
    const files = req.files;

    for (const file of files) {
      const { path } = file;
      const newpath = await uploader(path);
      urls.push(newpath);
      fs.unlinkSync(path);
    }
    const findProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { images: urls.map((file) => file) },
      { new: true }
    );
    res.json(findProduct);
  } catch (error) {
    throw new Error(error.message);
  }
});

module.exports = {
  rating,
  uploadImages,
  createProduct,
  updateProduct,
  deleteProduct,
  addToWishList,
  getAllProduct,
  getProductById,
  getProductBySlug,
};
