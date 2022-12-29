const { Router } = require('express');
const { uploadImages, deleteImages } = require('../controllers/UploadController');

const { verifyAdmin } = require('../middlewares/authMiddleware');
const { uploadPhoto, productImgResize } = require('../middlewares/uploadImages');

const router = Router();

router.post('/upload', verifyAdmin, uploadPhoto.array('images', 10), productImgResize, uploadImages);
router.delete('/delete/:id', verifyAdmin, deleteImages);

module.exports = router;
