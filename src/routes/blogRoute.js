const { Router } = require('express');
const {
  createBlog,
  updateBlog,
  getBlogBySlug,
  getAllBlog,
  getBlogById,
  deleteBlog,
  likeBlog,
  dislikeBlog,
  uploadImages,
} = require('../controllers/BlogController');
const { verifyAdmin, verifyUser } = require('../middlewares/authMiddleware');
const { uploadPhoto, blogImgResize } = require('../middlewares/uploadImages');

const router = Router();

router.post('/', verifyAdmin, createBlog);
router.get('/', getAllBlog);
router.get('/:id', getBlogById);
router.get('/slug/:slug', getBlogBySlug);

router.put('/upload/:id', verifyAdmin, uploadPhoto.array('images', 2), blogImgResize, uploadImages);
router.put('/likes', verifyUser, likeBlog);
router.put('/dislikes', verifyUser, dislikeBlog);

router.put('/:id', verifyAdmin, updateBlog);
router.delete('/:id', verifyAdmin, deleteBlog);

module.exports = router;
