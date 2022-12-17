const { Router } = require('express');
const { getAllBrand, createBrand, updateBrand, deleteBrand } = require('../controllers/BrandController');

const { verifyAdmin } = require('../middlewares/authMiddleware');

const router = Router();

router.post('/', verifyAdmin, createBrand);
router.get('/', getAllBrand);
router.put('/:id', verifyAdmin, updateBrand);
router.delete('/:id', verifyAdmin, deleteBrand);

module.exports = router;
