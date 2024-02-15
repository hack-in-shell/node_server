const express = require("express");
const router = express.Router();
const chatController = require("../../controllers/chat/chatController.js");
const auth = require("../../middleware/auth.js");


//view my
router.post("/view", chatController.getMessage);

//view my
router.post("/friends", chatController.getFriends);
// login user
//router.post("/send", chatController.sendMessage);

// Expose the router and server for further use
module.exports = router;
