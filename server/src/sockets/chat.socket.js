const messageService = require('../services/message.service');
const studyGroupRepository = require('../repositories/studyGroup.repository');
const messageRepository = require('../repositories/message.repository');
const logger = require('../utils/logger');

const handleChatSocket = (io) => {
  io.on('connection', (socket) => {
    socket.on('join_group', (groupId) => {
      socket.join(groupId);
      logger.info(`User ${socket.id} joined group: ${groupId}`);
    });

    socket.on('join_notes', async (groupId) => {
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
    });

    socket.on('update_note', async (data) => {
      const { groupId, content, userId } = data;
      logger.info(`Updating notes for group ${groupId}: ${content.substring(0, 20)}...`);
      try {
        const updatedGroup = await studyGroupRepository.updateNotes(groupId, content, userId);
        socket.to(`notes_${groupId}`).emit('note_update', content);
        io.to(`notes_${groupId}`).emit('note_history_update', updatedGroup.noteHistory || []);
      } catch (error) {
        logger.error(`Error updating notes: ${error.message}`);
      }
    });

    socket.on('send_message', async (data) => {
      const { group, sender, content, type, fileName, fileSize, fileData } = data;
      try {
        const message = await messageService.sendMessage({ 
          group, 
          sender, 
          content, 
          type, 
          fileName, 
          fileSize, 
          fileData 
        });
        io.to(group).emit('receive_message', message);
      } catch (error) {
        logger.error(`Error sending message via socket: ${error.message}`);
      }
    });

    socket.on('add_reaction', async (data) => {
      const { messageId, userId, emoji, groupId } = data;
      logger.info(`Adding reaction to message ${messageId} by user ${userId}: ${emoji}`);
      try {
        const updatedMessage = await messageRepository.addReaction(messageId, userId, emoji);
        if (updatedMessage) {
          logger.info(`Reaction updated successfully, broadcasting to room: ${groupId}`);
          io.to(groupId).emit('message_updated', updatedMessage);
        }
      } catch (error) {
        logger.error(`Error adding reaction: ${error.message}`);
      }
    });

    socket.on('typing', (data) => {
      const { group, userName } = data;
      socket.to(group).emit('user_typing', { userName });
    });

    socket.on('stop_typing', (data) => {
      const { group } = data;
      socket.to(group).emit('user_stop_typing');
    });

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = handleChatSocket;
