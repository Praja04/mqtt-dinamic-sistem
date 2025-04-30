const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');

// API untuk ambil semua topic
router.get('/topics', configController.getTopics);

// API untuk tambah topic
router.post('/topics', configController.saveTopic);  // Memanggil saveTopic di sini

// API untuk hapus topic
router.delete('/topics/:topic', configController.deleteTopic);

router.post('/create-table', configController.createTable);
module.exports = router;