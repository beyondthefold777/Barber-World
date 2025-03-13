const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const auth = require('../middleware/auth');

router.post('/', auth, documentController.createDocument);
router.get('/barbershop-documents', auth, documentController.getBarbershopDocuments);
router.put('/:id', auth, documentController.updateDocument);
router.delete('/:id', auth, documentController.deleteDocument);

module.exports = router;