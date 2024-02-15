const express = require("express");
const router = express.Router();
const productController = require("../../controllers/product/productController.js");
const auth = require("../../middleware/auth.js");

//view all
router.get("/view", productController.viewProduct);

//view my
router.get("/view/:ownerId", productController.viewMyProduct);

// login user
router.post("/add", productController.addProduct);

//signup user
router.put("/update/:id", productController.updateProduct);

//signupGoogle user
router.delete("/delete/:id", productController.deleteProduct);


module.exports = router;
