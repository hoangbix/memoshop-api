const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const uniqid = require('uniqid');
const asyncHandler = require('express-async-handler');

const User = require('../models/UserModel');
const Cart = require('../models/CardModel');
const Order = require('../models/OrderModel');
const sendEmail = require('./EmailController');
const Coupon = require('../models/CouponModel');
const Product = require('../models/ProductModel');
const { generateToken } = require('../configs/verifyToken');
const { generateRefreshToken } = require('../configs/refreshToken');

const register = asyncHandler(async (req, res) => {
  try {
    const email = req.body.email;
    const findUser = await User.findOne({ email: email });
    if (findUser) throw new Error('The email was registered');

    const newUser = await User.create(req.body);
    const { password, ...otherUser } = newUser._doc;

    res.json(otherUser);
  } catch (error) {
    throw new Error(error.message);
  }
});

const login = asyncHandler(async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) throw new Error('User not found');

    const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordCorrect) throw new Error(`Password incorrect`);

    const refreshToken = await generateRefreshToken(user._id, user.role);
    await User.findByIdAndUpdate(user._id, { refreshToken }, { new: true });

    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 72 * 60 * 60 * 1000 });

    res.json({
      id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      mobile: user.mobile,
      access_token: generateToken(user._id, user.role),
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

const adminLogin = asyncHandler(async (req, res) => {
  try {
    const admin = await User.findOne({ email: req.body.email });
    if (!admin) throw new Error('User not found');

    if (admin.role !== 'admin') throw new Error('Only the administrator has access');

    const isPasswordCorrect = await bcrypt.compare(req.body.password, admin.password);
    if (!isPasswordCorrect) throw new Error(`Password incorrect`);

    const refreshToken = await generateRefreshToken(admin._id, admin.role);
    await User.findByIdAndUpdate(admin._id, { refreshToken }, { new: true });

    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 72 * 60 * 60 * 1000 });

    res.json({
      id: admin._id,
      firstname: admin.firstname,
      lastname: admin.lastname,
      email: admin.email,
      mobile: admin.mobile,
      access_token: generateToken(admin._id, admin.role),
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

const refreshTokenHandler = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  const refreshToken = cookie.refreshToken;

  if (!refreshToken) throw new Error('Refresh token missing');
  const user = await User.findOne({ refreshToken }).select('-password');
  if (!user) throw new Error('Refresh token invalid');

  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) throw new Error('There is something wrong with refresh token');

    const accessToken = generateToken(user._id, user.role);
    res.json({ accessToken });
  });
  res.json(user);
});

const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  const refreshToken = cookie.refreshToken;
  if (!refreshToken) throw new Error('Refresh token missing');

  const user = await User.findOne({ refreshToken }).select('-password');
  if (!user) {
    res.clearCookie('refreshToken', { httpOnly: true, secure: true });
    return res.sendStatus(204);
  }
  await User.findOneAndReplace(refreshToken, { refreshToken: '' });
  res.clearCookie('refreshToken', { httpOnly: true, secure: true });
  res.sendStatus(204);
});

const updateUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        mobile: req.body.mobile,
      },
      { new: true }
    ).select('-password');

    if (!user) throw new Error('User not found');

    res.json(user);
  } catch (error) {
    throw new Error(error.message);
  }
});

const getAllUser = asyncHandler(async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    throw new Error(error.message);
  }
});

const getUserById = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) throw new Error('User not found');

    res.json(user);
  } catch (error) {
    throw new Error(error.message);
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw new Error('User not found');

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    throw new Error(error.message);
  }
});

const blockUser = asyncHandler(async (req, res) => {
  try {
    if (req.user.id === req.params.id) throw new Error("You can't block yourself");

    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: true }, { new: true });
    if (!user) throw new Error('User not found');

    if (user.isBlocked) throw new Error('User has been blocked before');

    res.json({ success: true, message: 'User blocked successfully' });
  } catch (error) {
    throw new Error(error.message);
  }
});

const unBlockUser = asyncHandler(async (req, res) => {
  try {
    if (req.user.id === req.params.id) throw new Error("You can't unblock yourself. Contact admin");

    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: false }, { new: true });
    if (!user) throw new Error('User not found');

    res.json({ success: true, message: 'User unblocked successfully' });
  } catch (error) {
    throw new Error(error.message);
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  try {
    if (!req.body.password) throw new Error('Password not provided');

    const user = await User.findById(req.user.id).select('-password');
    if (!user) throw new Error('User not found');

    const resettoken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resettoken).digest('hex');
    user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 10 minutes
    user.password = req.body.password;

    const passwordUpdate = await user.save();

    res.json(passwordUpdate);
  } catch (error) {
    throw new Error(error.message);
  }
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');

    const token = await user.createPasswordResetToken();
    await user.save();
    const resetUrl = `Hi. Please follow this link to reset your password. This link is valid till 10 minutes from now <a href="http://localhost:5000/api/v1/user/reset-password/${token}">Click here</a>`;
    const data = {
      to: email,
      text: `Hey ${user.lastname}`,
      subject: 'Forgot password link',
      html: resetUrl,
    };

    sendEmail(data);
    res.json(token);
  } catch (error) {
    throw new Error(error.message);
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password) throw new Error('Please enter a password');

  const { token } = req.params;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) throw new Error('Token expired, Please try again later');

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Password reset successfully' });
});

const getWishList = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    if (!user) throw new Error('User not found');
    res.json(user);
  } catch (error) {
    throw new Error(error.message);
  }
});

const saveAddress = asyncHandler(async (req, res) => {
  try {
    console.log(req.user.id);
    const user = await User.findByIdAndUpdate(req.user.id, { address: req.body.address }, { new: true }).select(
      '-password'
    );

    if (!user) throw new Error('User not found');

    res.json(user);
  } catch (error) {
    throw new Error(error.message);
  }
});

const userCart = asyncHandler(async (req, res) => {
  try {
    const { cart } = req.body;
    const { id } = req.user;
    let products = [];

    const user = await User.findById(id);
    if (!user) throw new Error('User not found');

    /** Check if user already have product in cart */
    const alreadyExistCart = await Cart.findOne({ orderBy: id });
    if (alreadyExistCart) alreadyExistCart.remove();

    for (let i = 0; i < cart.length; i++) {
      let object = {};
      object.product = cart[i]._id;
      object.count = cart[i].count;
      object.color = cart[i].color;
      let getPrice = await Product.findById(cart[i]._id).select('price').exec();
      object.price = getPrice.price;
      products.push(object);
    }

    let cartTotal = 0;
    for (let i = 0; i < products.length; i++) {
      cartTotal = cartTotal + products[i].price * products[i].count;
    }

    const newCart = await Cart.create({ products, cartTotal, orderBy: id });
    res.json(newCart);
  } catch (error) {
    throw new Error(error.message);
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  try {
    const { id } = req.user;
    const cart = await Cart.findOne({ orderBy: id }).populate('products.product');
    if (!cart) throw new Error('Cart not found');
    res.json(cart);
  } catch (error) {
    throw new Error(error.message);
  }
});

const emptyCart = asyncHandler(async (req, res) => {
  try {
    const { id } = req.user;
    const cart = await Cart.findOneAndRemove({ orderBy: id });
    if (!cart) throw new Error('Cart not found');
    res.json({ success: true, message: 'Cart successfully removed' });
  } catch (error) {
    throw new Error(error.message);
  }
});

const applyCoupon = asyncHandler(async (req, res) => {
  try {
    const { id } = req.user;
    const { coupon } = req.body;

    const validCoupon = await Coupon.findOne({ name: coupon });
    if (!validCoupon) throw new Error('Coupon not found');

    const user = await User.findById(id);
    if (!user) throw new Error('User not found');

    let { cartTotal } = await Cart.findOne({ orderBy: user._id }).populate('products.product');
    let totalAfterDiscount = (cartTotal - (cartTotal * validCoupon.discount) / 100).toFixed(0);
    await Cart.findOneAndUpdate({ orderBy: user._id }, { totalAfterDiscount }, { new: true });

    res.json(totalAfterDiscount);
  } catch (error) {
    throw new Error(error.message);
  }
});

const createOrder = asyncHandler(async (req, res) => {
  try {
    const { COD, couponApplied } = req.body;
    if (!COD) throw new Error('Create cash order failed');

    const user = await User.findById(req.user.id);
    let userCart = await Cart.findOne({ orderBy: user._id });
    let finalAmount = 0;

    if (couponApplied && userCart.totalAfterDiscount) {
      finalAmount = userCart.totalAfterDiscount;
    } else {
      finalAmount = userCart.cartTotal;
    }

    await Order.create({
      products: userCart.products,
      paymentIntent: {
        id: uniqid(),
        method: 'COD',
        amount: finalAmount,
        status: 'Cash on Delivery',
        created: Date.now(),
        currency: 'vnd',
      },
      orderBy: user._id,
      orderStatus: 'Cash on Delivery',
    });
    let update = userCart.products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product._id },
          update: { $inc: { quantity: -item.count, sold: +item.count } },
        },
      };
    });
    await Product.bulkWrite(update, {});

    res.json({ success: true });
  } catch (error) {
    throw new Error(error.message);
  }
});

const getOrder = asyncHandler(async (req, res) => {
  try {
    const { id } = req.user;
    const userOrder = await Order.findOne({ orderBy: id }).populate('products.product').exec();
    if (!userOrder) throw new Error('Order not found');
    res.json(userOrder);
  } catch (error) {
    throw new Error(error.message);
  }
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const updateStatus = await Order.findByIdAndUpdate(
      id,
      { orderStatus: status, paymentIntent: { status } },
      { new: true }
    );

    if (!updateStatus) throw new Error('Order not found');

    res.json(updateStatus);
  } catch (error) {
    throw new Error(error.message);
  }
});

module.exports = {
  login,
  logout,
  userCart,
  getOrder,
  register,
  blockUser,
  emptyCart,
  deleteUser,
  adminLogin,
  updateUser,
  getAllUser,
  unBlockUser,
  getUserCart,
  applyCoupon,
  saveAddress,
  createOrder,
  getWishList,
  getUserById,
  resetPassword,
  updatePassword,
  updateOrderStatus,
  refreshTokenHandler,
  forgotPasswordToken,
};
