const { Router } = require('express');
const { createCoupon, getAllCoupon, updateCoupon, deleteCoupon } = require('../controllers/CouponController');

const { verifyAdmin } = require('../middlewares/authMiddleware');

const router = Router();

router.post('/', verifyAdmin, createCoupon);
router.get('/', verifyAdmin, getAllCoupon);
router.put('/:id', verifyAdmin, updateCoupon);
router.delete('/:id', verifyAdmin, deleteCoupon);

module.exports = router;
