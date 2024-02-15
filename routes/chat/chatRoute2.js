const express = require("express");
const router = express.Router();
const chatController = require("../../controllers/chat/chatController2.js");
const auth = require("../../middleware/auth.js");

// send message
router.post("/send", chatController.startChat);

//view my
router.post("/receive", chatController.receiveAllMessage);

//view my
router.post("/chatlist", chatController.getAllFriends);



// Expose the router and server for further use
module.exports = router;
