const { Router } = require('express');
const { register, login, adminLogin } = require('../controllers/UserController');

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/admin-login', adminLogin);

module.exports = router;
