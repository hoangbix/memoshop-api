const { Router } = require('express');
const {
  logout,
  userCart,
  getOrder,
  emptyCart,
  blockUser,
  getAllUser,
  deleteUser,
  updateUser,
  unBlockUser,
  getWishList,
  saveAddress,
  getUserById,
  applyCoupon,
  createOrder,
  getUserCart,
  resetPassword,
  updatePassword,
  refreshTokenHandler,
  forgotPasswordToken,
  updateOrderStatus,
} = require('../controllers/UserController');

const { verifyUser, verifyAdmin } = require('../middlewares/authMiddleware');

const router = Router();

router.post('/cart', verifyUser, userCart);
router.post('/cart/apply-coupon', verifyUser, applyCoupon);
router.post('/cart/cash-order', verifyUser, createOrder);
router.post('/forgot-password-token', forgotPasswordToken);

router.get('/', verifyAdmin, getAllUser);
router.get('/refresh-token', refreshTokenHandler);
router.get('/logout', logout);
router.get('/wishlist', verifyUser, getWishList);
router.get('/cart', verifyUser, getUserCart);
router.get('/get-orders', verifyUser, getOrder);
router.get('/:id', verifyUser, getUserById);

router.put('/reset-password/:token', resetPassword);
router.put('/password', verifyUser, updatePassword);
router.put('/save-address', verifyUser, saveAddress);
router.put('/:id', verifyUser, updateUser);
router.put('/block-user/:id', verifyAdmin, blockUser);
router.put('/unblock-user/:id', verifyAdmin, unBlockUser);
router.put('/order/update-order/:id', verifyAdmin, updateOrderStatus);

router.delete('/empty-cart', verifyUser, emptyCart);
router.delete('/:id', verifyUser, deleteUser);

module.exports = router;
