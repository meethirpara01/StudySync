import { useEffect } from 'react';
import socket from '../sockets/socketClient';

export const useSocket = (groupId) => {
  useEffect(() => {
    if (groupId) {
      socket.connect();
      socket.emit('join_group', groupId);

      return () => {
        socket.emit('leave_group', groupId);
        socket.disconnect();
      };
    }
  }, [groupId]);

  return socket;
};

export default useSocket;
