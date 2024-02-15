const express = require("express");
const router = express.Router();
const userController = require("../../controllers/user/userController");

// login user
router.post("/login", userController.login);

//signup user
router.post("/signup", userController.signup);

//signupGoogle user
router.post("/signupgoogle", userController.signupGoogle);

//signupGoogle user
router.post("/profile/update/:id", userController.updateProfile);


module.exports = router;
