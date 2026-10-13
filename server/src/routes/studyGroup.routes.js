const express = require('express');
const router = express.Router();
const {
  createGroup,
  getAllGroups,
  getUserGroups,
  getGroupById,
  requestToJoinGroup,
  approveJoinRequest,
  acceptInvite,
  joinGroup,
  leaveGroup,
} = require('../controllers/studyGroup.controller');
const { protect } = require('../middlewares/auth.middleware');

router.route('/')
  .get(getAllGroups)
  .post(protect, createGroup);

router.route('/my-groups').get(protect, getUserGroups);

router.route('/:id/request-join').post(protect, requestToJoinGroup);
router.route('/:id/approve-request').post(protect, approveJoinRequest);
router.route('/:id/accept-invite').post(protect, acceptInvite);
router.route('/:id/join').post(protect, joinGroup);
router.route('/:id/leave').post(protect, leaveGroup);

router.route('/:id')
  .get(protect, getGroupById);

module.exports = router;
