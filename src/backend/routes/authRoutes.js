const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const imageController = require("../controllers/imageController");

// Route for user login
router.post("/login", authController.login);

//Route for user registration
router.post("/signup", authController.signup);

// Route for image retrieval with sorting, filtering, and pagination
router.get("/images", imageController.retrieveImages);

module.exports = router;
