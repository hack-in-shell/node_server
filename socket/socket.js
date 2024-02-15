const { Server } = require("socket.io");
const chatController = require('../controllers/chat/chatController')

// Export a function that initializes Socket.IO
module.exports = (server) => {
  const io = new Server(server);
  const userSocketMap = {};
  const pendingMessages = {};

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    userSocketMap[userId] = socket;
    console.log("id " + userId + ' is connected');
    
    // Check for pending messages for the user and send them
    if (pendingMessages[userId]) {
      pendingMessages[userId].forEach((pendingMessage) => {
        socket.emit('private message', pendingMessage);
      });
      // Clear the pending messages for the user
      delete pendingMessages[userId];
    }

    // Handle private messages
    socket.on('private message', async (data, acknowledgment) => {
      try {
        console.log('Private message received:', data);
        const result = await chatController.sendMessage(data);
        const updateFriends = await chatController.updateFriends(data);
        const chatId = result.chat._id;
        
        acknowledgment({ status: 'Message received successfully', _id: chatId });


        const sendTo = data.sendTo;
        const userSocket = userSocketMap[sendTo];

        // Broadcast the private message to the specified recipient
        // socket.to(sendTo).emit('private message', {
        //     user: {
        //         _id: sendBy,
        //         name: 'Sender Name', // Replace with the actual sender's name
        //     },
        // });

        // if (userSocket) {
        //     userSocket.emit('server-initiated-message', { user: data });  
        // } 
        // else {
        //   console.error(`User with ID ${sendTo} is not currently connected.`);
        // }
        if (userSocket) {
          const chat ={
            _id : result.chat._id,
            createdAt : result.chat.createdAt,
            text: result.chat.message,
            user : {
              _id: result.chat.sendBy,
            },

          }

          userSocket.emit('private message', {
            chat: chat,
          });
        }
        else {
          // If the recipient is offline, store the message in pendingMessages
          if (!pendingMessages[sendTo]) {
            pendingMessages[sendTo] = [];
          }
          pendingMessages[sendTo].push({
            user: data,
          });
          console.log(`User with ID ${sendTo} is not currently connected. Message will be delivered when they reconnect.`);
        }
        
      }
      catch (error) {
        console.error("Error during sending private message:", error);
        // socket.to(socket.id).emit('private message', {
        //     error: "Internal server error",
        // });
      }
    });

    // Handle disconnect event
    // socket.on('disconnect', () => {
    //   console.log('User disconnected');
    // });
    socket.on('disconnect', () => {
      console.log('User disconnected');
      delete userSocketMap[userId];
    });
  });
};
