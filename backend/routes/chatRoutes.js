const express = require('express');
const router = express.Router();
const { processQuery } = require('../controllers/chatController');

// POST /api/chat - Process chatbot query
router.post('/', processQuery);

module.exports = router;
