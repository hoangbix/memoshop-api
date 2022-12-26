const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

const verifyUser = asyncHandler((req, res, next) => {
  if (!req?.headers?.authorization?.startsWith('Bearer')) throw new Error('There is no token attached to headers');
  const token = req.headers.authorization.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) throw new Error('Token is invalid');

    req.user = user;
    next();
  });
});

const verifyAdmin = asyncHandler(async (req, res, next) => {
  verifyUser(req, res, () => {
    if (req.user.role !== 'admin') throw new Error('Only the administrator has access');
    next();
  });
});

module.exports = { verifyUser, verifyAdmin };
