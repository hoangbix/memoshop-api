const asyncHandler = require('express-async-handler');
const slugify = require('slugify');
const fs = require('fs');

const Blog = require('../models/BlogModel');
const cloudinaryUploadImg = require('../utils/cloudinary');

const createBlog = asyncHandler(async (req, res) => {
  try {
    req.body.slug = slugify(req.body.title);
    const blog = await Blog.create(req.body);
    res.json(blog);
  } catch (error) {
    throw new Error(error.message);
  }
});

const getAllBlog = asyncHandler(async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.json(blogs);
  } catch (error) {
    throw new Error(error.message);
  }
});

const getBlogById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateView = await Blog.findByIdAndUpdate(id, { $inc: { numRevire: 1 } }, { new: true })
      .populate('likes')
      .populate('dislikes');
    if (!updateView) throw new Error('Blog not found');

    res.json(updateView);
  } catch (error) {
    throw new Error(error.message);
  }
});

const getBlogBySlug = asyncHandler(async (req, res) => {
  try {
    const { slug } = req.params;
    const updateView = await Blog.findOneAndUpdate({ slug }, { $inc: { numRevire: 1 } }, { new: true })
      .populate('likes')
      .populate('dislikes');
    if (!updateView) throw new Error('Blog not found');

    res.json(updateView);
  } catch (error) {
    throw new Error(error.message);
  }
});

const updateBlog = asyncHandler(async (req, res) => {
  try {
    const updateBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updateBlog) throw new Error('Blog not found');

    res.json(updateBlog);
  } catch (error) {
    throw new Error(error.message);
  }
});

const deleteBlog = asyncHandler(async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) throw new Error('Blog not found');

    res.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    throw new Error(error.message);
  }
});

const likeBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;

  /**Find the blog which you want to be liked */
  const blog = await Blog.findById(blogId);
  if (!blog) throw new Error('Blog not found');

  /**Find login user current */
  const loginUserId = req.user.id;
  /**Find if the user has liked the blog */
  const isLiked = blog.isLiked;
  /**Find if the user has disliked the blog */
  const alreadyDisliked = blog.dislikes?.find((userId) => userId.toString() === loginUserId?.toString());

  if (alreadyDisliked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      { $pull: { dislikes: loginUserId }, isDisliked: false },
      { new: true }
    );
    res.json(blog);
  }

  if (isLiked) {
    const blog = await Blog.findByIdAndUpdate(blogId, { $pull: { likes: loginUserId }, isLiked: false }, { new: true });
    res.json(blog);
  } else {
    const blog = await Blog.findByIdAndUpdate(blogId, { $push: { likes: loginUserId }, isLiked: true }, { new: true });
    res.json(blog);
  }
});

const dislikeBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;

  /**Find the blog which you want to be liked */
  const blog = await Blog.findById(blogId);
  if (!blog) throw new Error('Blog not found');

  /**Find login user current */
  const loginUserId = req.user.id;
  /**Find if the user has liked the blog */
  const isDisLiked = blog.isDisliked;
  /**Find if the user has disliked the blog */
  const alreadyLiked = blog.likes?.find((userId) => userId.toString() === loginUserId?.toString());

  if (alreadyLiked) {
    const blog = await Blog.findByIdAndUpdate(blogId, { $pull: { likes: loginUserId }, isLiked: false }, { new: true });
    res.json(blog);
  }

  if (isDisLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      { $pull: { dislikes: loginUserId }, isDisliked: false },
      { new: true }
    );
    res.json(blog);
  } else {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      { $push: { dislikes: loginUserId }, isDisliked: true },
      { new: true }
    );
    res.json(blog);
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
    const findBlog = await Blog.findByIdAndUpdate(req.params.id, { images: urls.map((file) => file) }, { new: true });
    res.json(findBlog);
  } catch (error) {
    throw new Error(error.message);
  }
});

module.exports = {
  likeBlog,
  deleteBlog,
  createBlog,
  updateBlog,
  getAllBlog,
  getBlogById,
  dislikeBlog,
  uploadImages,
  getBlogBySlug,
};
