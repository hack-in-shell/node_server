const pool = require("../../db");
const { ChatModel } = require('../../models/chat/chatModel'); 

    const getMessage = async (req, res) => {
    //console.log(req.body);
      try {
        // const { _id, sendBy, sendTo, message, createdAt } = req.body;
        const {sendBy, sendTo} = req.body;
        //console.log(req.body);
        // TODO: Validate email and password inputs
        
        const query = `
            SELECT * FROM chats
            WHERE (send_by = $1 AND send_to = $2) OR (send_by = $2 AND send_to = $1);
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

    const getFriends = async (req, res) => {
      //console.log(req.body);
        try {
          // const { _id, sendBy, sendTo, message, createdAt } = req.body;
          const {userId} = req.body;
          //console.log(req.body);
          // TODO: Validate email and password inputs
          
          const query = `
            SELECT *
            FROM friends
            WHERE (send_by = $1 OR send_to = $1);
          `;

          const values = [userId];
      
          const result = await pool.query(query, values);
          //console.log(result.rows);
          const chatModel = result.rows.map(row => new ChatModel(row));
          res.status(200).json({ message: "friends collected", friends: chatModel });
          
        } catch (error) {
          console.error("Error during login:", error);
          res.status(500).json({ error: "Internal server error" });
        }
      };

    // const sendMessage = async (req, res) => {
    //     try {
    //       const { sendBy, sendTo, message, createdAt } = req.body;
          
    //       const query = `
    //         INSERT INTO chats 
    //           (send_by, send_to, message, created_at) 
    //         VALUES 
    //           ($1, $2, $3, $4) RETURNING id;
    //       `;
    //       const values = [sendBy, sendTo, message, createdAt];
      
    //       const result = await pool.query(query, values);
    //       const chatId = result.rows[0].id;
          
    //       res.status(201).json({ message: "message sent", _id:chatId});
    //     } catch (error) {
    //       console.error("Error during login:", error);
    //       res.status(500).json({ error: "Internal server error" });
    //     }
    //   };


    const sendMessage = async (data) => {
      try {
        const { sendBy, sendTo, message, createdAt } = data;
    
        const query = `
          INSERT INTO chats 
            (send_by, send_to, message, created_at) 
          VALUES 
            ($1, $2, $3, $4) RETURNING *;
        `;
        const values = [sendBy, sendTo, message, createdAt];
        const result = await pool.query(query, values);

        const chatModel = new ChatModel(result.rows[0]);
        const chatId = result.rows[0].id;
    
        // return { message: "message sent", _id: chatId };
        return { message: "message sent", chat: chatModel};
      } catch (error) {
        console.error("Error during sending message:", error);
        throw error;
      }
    };

    const updateFriends = async (data) => {
      try {
        const { sendBy, sendTo, createdAt } = data;
    
        const query = `
          INSERT INTO friends (send_by, send_to, created_at) 
          VALUES ($1, $2, $3)
          ON CONFLICT (send_by, send_to) DO UPDATE
          SET created_at = $3
          RETURNING *;
        `;
        const values = [sendBy, sendTo, createdAt];
        const result = await pool.query(query, values);

        const chatModel = new ChatModel(result.rows[0]);
    
        // return { message: "message sent", _id: chatId };
        return { message: "message sent", chat: chatModel};
      } catch (error) {
        console.error("Error during sending message:", error);
        throw error;
      }
    };

    module.exports = {
        getMessage,
        sendMessage,
        updateFriends,
        getFriends,
    };
