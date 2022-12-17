const { Router } = require('express');
const {
  createBlogCategory,
  getAllBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
} = require('../controllers/BlogCatController');

const { verifyAdmin } = require('../middlewares/authMiddleware');

const router = Router();

router.post('/', verifyAdmin, createBlogCategory);
router.get('/', getAllBlogCategory);
router.put('/:id', verifyAdmin, updateBlogCategory);
router.delete('/:id', verifyAdmin, deleteBlogCategory);

module.exports = router;
