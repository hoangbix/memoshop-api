const { Router } = require('express');
const {
  createProduct,
  getProductBySlug,
  getProductById,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addToWishList,
  rating,
} = require('../controllers/ProductController');
const { verifyAdmin, verifyUser } = require('../middlewares/authMiddleware');
const { uploadPhoto, productImgResize } = require('../middlewares/uploadImages');

const router = Router();

router.post('/', verifyAdmin, createProduct);

router.get('/', getAllProduct);
router.get('/:id', getProductById);
router.get('/slug/:slug', getProductBySlug);

router.put('/wishlist', verifyUser, addToWishList);
router.put('/rating', verifyUser, rating);
router.put('/:id', verifyAdmin, updateProduct);

router.delete('/:id', verifyAdmin, deleteProduct);

module.exports = router;
