const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const sharpConfig = require('../middleware/sharp-config');

const bookCtrl = require('../controllers/book');

router.get('/', bookCtrl.getAllBooks);
router.post('/', auth, multer, sharpConfig, bookCtrl.createBook);
router.get('/:id', bookCtrl.getOneBook);
router.put('/:id', auth, multer, sharpConfig, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);

module.exports = router;