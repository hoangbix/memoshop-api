const { Router } = require('express');
const {
  createProdCategory,
  getAllProdCategory,
  updateProdCategory,
  deleteProdCategory,
} = require('../controllers/ProdCategoryController');

const { verifyAdmin } = require('../middlewares/authMiddleware');

const router = Router();

router.post('/', verifyAdmin, createProdCategory);
router.get('/', getAllProdCategory);
router.put('/:id', verifyAdmin, updateProdCategory);
router.delete('/:id', verifyAdmin, deleteProdCategory);

module.exports = router;
