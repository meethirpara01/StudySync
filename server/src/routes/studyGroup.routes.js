const express = require('express');
const router = express.Router();
const {
  createGroup,
  getAllGroups,
  getUserGroups,
  getGroupById,
  acceptInvite,
  requestToJoinGroup,
  reviewJoinRequest,
  joinGroup,
  leaveGroup,
} = require('../controllers/studyGroup.controller');
const { protect } = require('../middlewares/auth.middleware');

router.route('/')
  .get(protect, getAllGroups)
  .post(protect, createGroup);

router.route('/my-groups').get(protect, getUserGroups);

router.route('/:id')
  .get(protect, getGroupById);

router.route('/:id/join').post(protect, joinGroup);
router.route('/:id/accept-invite').post(protect, acceptInvite);
router.route('/:id/join-request').post(protect, requestToJoinGroup);
router.route('/:id/join-requests/:userId/:status').post(protect, reviewJoinRequest);
router.route('/:id/leave').post(protect, leaveGroup);

module.exports = router;
