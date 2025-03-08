const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const auth = require('../middleware/auth');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post('/upload', auth, upload.single('document'), documentController.uploadDocument);
router.get('/user-documents', auth, documentController.getUserDocuments);

module.exports = router;