const { Router } = require('express');

const authRouter = require('./authRoute');
const userRouter = require('./userRoute');
const blogRouter = require('./blogRoute');
const uploadRouter = require('./uploadRoute');
const brandRouter = require('./brandRoute');
const couponRouter = require('./couponRoute');
const blogCatRouter = require('./blogCatRoute');
const productRouter = require('./productRoute');
const prodCategoryRouter = require('./prodCategoryRoute');

const rootRouter = Router();

rootRouter.use('/blog', blogRouter);
rootRouter.use('/auth', authRouter);
rootRouter.use('/user', userRouter);
rootRouter.use('/brand', brandRouter);
rootRouter.use('/files', uploadRouter);
rootRouter.use('/coupon', couponRouter);
rootRouter.use('/product', productRouter);
rootRouter.use('/blog-category', blogCatRouter);
rootRouter.use('/prod-category', prodCategoryRouter);

module.exports = rootRouter;
