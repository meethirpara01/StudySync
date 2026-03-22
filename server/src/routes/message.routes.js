const express = require('express');
const router = express.Router();
const {
  getGroupMessages,
  sendMessage,
} = require('../controllers/message.controller');
const { protect } = require('../middlewares/auth.middleware');

router.route('/')
  .post(protect, sendMessage);

router.route('/:groupId')
  .get(protect, getGroupMessages);

module.exports = router;
