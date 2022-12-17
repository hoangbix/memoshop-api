const asyncHandler = require('express-async-handler');
const Coupon = require('../models/CouponModel');

const createCoupon = asyncHandler(async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.json(coupon);
  } catch (error) {
    throw new Error(error.message);
  }
});

const getAllCoupon = asyncHandler(async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (error) {
    throw new Error(error.message);
  }
});

const updateCoupon = asyncHandler(async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) throw new Error('Coupon not found');
    res.json(coupon);
  } catch (error) {
    throw new Error(error.message);
  }
});

const deleteCoupon = asyncHandler(async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) throw new Error('Coupon not found');
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    throw new Error(error.message);
  }
});

module.exports = {
  createCoupon,
  getAllCoupon,
  updateCoupon,
  deleteCoupon,
};
