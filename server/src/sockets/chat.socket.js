const messageService = require('../services/message.service');
const studyGroupRepository = require('../repositories/studyGroup.repository');
const messageRepository = require('../repositories/message.repository');
const studyGroupService = require('../services/studyGroup.service');
const logger = require('../utils/logger');

const handleChatSocket = (io) => {
  io.on('connection', (socket) => {
    const deny = (callback) => {
      socket.emit('group_access_denied');
      if (typeof callback === 'function') callback({ ok: false, message: 'You do not have access to this study group' });
    };

    const requireMember = async (groupId, callback) => {
      try {
        return await studyGroupService.requireMember(groupId, socket.user._id);
      } catch (error) {
        deny(callback);
        return null;
      }
    };

    socket.on('join_group', async (groupId, callback) => {
      if (await requireMember(groupId, callback)) {
        socket.join(groupId);
        logger.info(`User ${socket.id} joined group: ${groupId}`);
        if (typeof callback === 'function') callback({ ok: true });
      }
    });

    socket.on('leave_group', (groupId) => {
      socket.leave(groupId);
      socket.leave(`notes_${groupId}`);
    });

    socket.on('join_notes', async (groupId, callback) => {
      if (!(await requireMember(groupId, callback))) return;

      socket.join(`notes_${groupId}`);
      try {
        const group = await studyGroupRepository.findById(groupId);
        if (group) {
          socket.emit('note_update', group.notes || '');
          socket.emit('note_history_update', group.noteHistory || []);
        }
      } catch (error) {
        logger.error(`Error joining notes: ${error.message}`);
      }
      logger.info(`User ${socket.id} joined notes room for: ${groupId}`);
      if (typeof callback === 'function') callback({ ok: true });
    });

    socket.on('update_note', async (data) => {
      const { groupId, content } = data;
      if (!(await requireMember(groupId))) return;
      logger.info(`Updating notes for group ${groupId}: ${content.substring(0, 20)}...`);
      try {
        const updatedGroup = await studyGroupRepository.updateNotes(groupId, content, socket.user._id);
        socket.to(`notes_${groupId}`).emit('note_update', content);
        io.to(`notes_${groupId}`).emit('note_history_update', updatedGroup.noteHistory || []);
      } catch (error) {
        logger.error(`Error updating notes: ${error.message}`);
      }
    });

    socket.on('send_message', async (data) => {
      const { group, content, type, fileName, fileSize, fileData } = data;
      if (!(await requireMember(group))) return;
      try {
        const message = await messageService.sendMessage({ 
          group, 
          sender: socket.user._id,
          content, 
          type, 
          fileName, 
          fileSize, 
          fileData 
        }, socket.user._id);
        io.to(group).emit('receive_message', message);
      } catch (error) {
        logger.error(`Error sending message via socket: ${error.message}`);
      }
    });

    socket.on('add_reaction', async (data) => {
      const { messageId, emoji, groupId } = data;
      if (!(await requireMember(groupId))) return;
      logger.info(`Adding reaction to message ${messageId} by user ${socket.user._id}: ${emoji}`);
      try {
        const updatedMessage = await messageRepository.addReaction(messageId, socket.user._id, emoji);
        if (updatedMessage) {
          logger.info(`Reaction updated successfully, broadcasting to room: ${groupId}`);
          io.to(groupId).emit('message_updated', updatedMessage);
        }
      } catch (error) {
        logger.error(`Error adding reaction: ${error.message}`);
      }
    });

    socket.on('typing', async (data) => {
      const { group, userName } = data;
      if (!(await requireMember(group))) return;
      socket.to(group).emit('user_typing', { userName });
    });

    socket.on('stop_typing', async (data) => {
      const { group } = data;
      if (!(await requireMember(group))) return;
      socket.to(group).emit('user_stop_typing');
    });

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = handleChatSocket;
