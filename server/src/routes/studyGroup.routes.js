const express = require('express');
const router = express.Router();
const {
  createGroup,
  getAllGroups,
  getUserGroups,
  getGroupById,
  joinGroup,
  leaveGroup,
} = require('../controllers/studyGroup.controller');
const { protect } = require('../middlewares/auth.middleware');

router.route('/')
  .get(getAllGroups)
  .post(protect, createGroup);

router.route('/my-groups').get(protect, getUserGroups);

router.route('/:id')
  .get(protect, getGroupById);

router.route('/:id/join').post(protect, joinGroup);
router.route('/:id/leave').post(protect, leaveGroup);

module.exports = router;
