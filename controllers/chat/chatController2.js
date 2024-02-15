const pool = require("../../db");
const { ChatListModel } = require("../../models/chat/chatListModel");
const { ChatModel } = require('../../models/chat/chatModel'); 
const pubnub = require('../../pubnub/pubnubConfig');

  const startChat = async(req, res) => {
    try {
      const { sendBy, sendTo, message, createdAt } = req.body;
  
      const query = `
        INSERT INTO chats 
          (send_by, send_to, message, created_at) 
        VALUES 
          ($1, $2, $3, $4) RETURNING *;
      `;
      const values = [sendBy, sendTo, message, createdAt];
      const result = await pool.query(query, values);

      const chatModel = new ChatModel(result.rows[0]);

      const channelName = `chat_${sendBy}_${sendTo}`;

      const chat ={
        _id : chatModel._id,
        createdAt : chatModel.createdAt,
        text: chatModel.message,
        user : {
          _id: chatModel.sendBy,
        },

      }
      // console.log(chat);
      // console.log(channelName);
      const newUpdateSendersFriends = await updateSendersFriends(req.body);
      const newUpdateReceiversFriends = await updateReceiversFriends(req.body);
      console.log(newUpdateReceiversFriends);

      res.status(200).json({ message: "message sent", chat: chat});

      pubnub.publish({
        channel: channelName,
        message: { text: chat },
      });

      pubnub.publish({
        channel: `chatlist_${sendBy}`,
        message: { chatList: newUpdateSendersFriends },
      });

      pubnub.publish({
        channel: `friends_${sendTo}`,
        message: { chatList: newUpdateReceiversFriends },
      });

      //return { message: "message sent", chat: chatModel};

    } catch (error) {
      console.error("Error dduring sending message:", error);
      throw error;
    }
  };

    const receiveAllMessage = async (req, res) => {
    //console.log(req.body);
      try {
        // const { _id, sendBy, sendTo, message, createdAt } = req.body;
        const {sendBy, sendTo} = req.body;
        //console.log(req.body);
        // TODO: Validate email and password inputs
        
        const query = `
            SELECT * FROM chats
            WHERE (send_by = $1 AND send_to = $2) OR (send_by = $2 AND send_to = $1) 
            ORDER BY created_at DESC
            LIMIT 14;
        `;
        const values = [sendBy, sendTo];
    
        const result = await pool.query(query, values);
        const chatModel = result.rows.map(row => new ChatModel(row));
        res.status(200).json({ message: "message collected", chats: chatModel });
        
      } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    };

    const getAllFriends = async (req, res) => {
      //console.log(req.body);
        try {
          // const { _id, sendBy, sendTo, message, createdAt } = req.body;
          const {userId} = req.body;
          // console.log(req.body);
          
          // const query = `
          //   SELECT *
          //   FROM friends
          //   WHERE (user_id = $1);
          // `;
          const query = `
            SELECT friends.*, people.name
            FROM friends
            JOIN people ON friends.friend_id = people.id
            WHERE friends.user_id = $1
            ORDER BY created_at DESC;
          `

          const values = [userId];
      
          const result = await pool.query(query, values);
          //console.log(result.rows);
          const chatList = result.rows.map(row => new ChatListModel(row));
          res.status(200).json({ message: "chat list collected", chatList: chatList });
          
        } catch (error) {
          console.error("Error during login:", error);
          res.status(500).json({ error: "Internal server error" });
        }
      };


    const updateSendersFriends = async (data) => {
      try {
        const { sendBy, sendTo, createdAt } = data;
    
        // const query = `
        //   WITH upsert AS (
        //     INSERT INTO friends (user_id, friend_id, sender_id, message_status, created_at) 
        //     VALUES ($1, $2, $3, $4, $5)
        //     ON CONFLICT (user_id, friend_id) DO UPDATE
        //     SET created_at = EXCLUDED.created_at,
        //         message_status = $4
        //     RETURNING *
        //   )
        //   SELECT * FROM friends WHERE user_id = $1;
        // `;
        
        // const query = `
        //   WITH upsert AS (
        //     INSERT INTO friends (user_id, friend_id, sender_id, message_status, created_at) 
        //     VALUES ($1, $2, $3, $4, $5)
        //     ON CONFLICT (user_id, friend_id) DO UPDATE
        //     SET created_at = EXCLUDED.created_at,
        //         message_status = $4
        //     RETURNING *
        //   )
        //   SELECT upsert.*, people.name
        //   FROM upsert
        //   JOIN people ON upsert.user_id = people.id;
        // `;
        const query = `
          WITH upsert AS (
              INSERT INTO friends (user_id, friend_id, sender_id, message_status, created_at) 
              VALUES ($1, $2, $3, $4, $5)
              ON CONFLICT (user_id, friend_id) DO UPDATE
              SET created_at = EXCLUDED.created_at,
                  message_status = $4
              RETURNING *
          )
          SELECT upsert.*, people.name
          FROM upsert
          JOIN people ON upsert.user_id = people.id
          WHERE upsert.user_id = $1
          ORDER BY upsert.created_at DESC;
      `;

      
      
        const values = [sendBy, sendTo, sendBy, false, createdAt];

        const result = await pool.query(query, values);
        //console.log(result);
        const chatList = result.rows.map(row => new ChatListModel(row));

        return { chatList: chatList};

      } catch (error) {
        console.error("Error during sending message:", error);
        throw error;
      }
    };

    
    const updateReceiversFriends = async (data) => {
      try {
        const { sendBy, sendTo, createdAt } = data;

        // const query = `
        //   WITH upsert AS (
        //     INSERT INTO friends (user_id, friend_id, sender_id, message_status, created_at) 
        //     VALUES ($1, $2, $3, $4, $5)
        //     ON CONFLICT (user_id, friend_id) DO UPDATE
        //     SET created_at = EXCLUDED.created_at,
        //         message_status = $4
        //     RETURNING *
        //   )
        //   SELECT * FROM friends WHERE user_id = $1;
        // `;
        const query = `
          WITH upsert AS (
              INSERT INTO friends (user_id, friend_id, sender_id, message_status, created_at) 
              VALUES ($1, $2, $3, $4, $5)
              ON CONFLICT (user_id, friend_id) DO UPDATE
              SET created_at = EXCLUDED.created_at,
                  message_status = $4
              RETURNING *
          )
          SELECT upsert.*, people.name
          FROM upsert
          JOIN people ON upsert.user_id = people.id
          WHERE upsert.user_id = $1
          ORDER BY upsert.created_at DESC;
      `;
      
        const values = [sendTo, sendBy, sendBy, true, createdAt];

        const result = await pool.query(query, values);

        const chatListModel = result.rows.map(row => new ChatListModel(row));
        // console.log(chatListModel);
        return chatListModel;

      } catch (error) {
        console.error("Error during sending message:", error);
        throw error;
      }
    };

    module.exports = {
        startChat,
        receiveAllMessage,
        updateSendersFriends,
        updateReceiversFriends,
        getAllFriends,
    };
