const express = require("express");
const router = express.Router();
const searchController = require("../controllers/searchController");

router.get("/search", searchController.search);
router.post("/save-item", searchController.saveItem);
router.delete("/delete-item/:id", searchController.deleteItem);
router.post("save-search", searchController.saveSearch);
router.delete("/delete-search/:id", searchController.deleteSearch);
router.get("/saved-searches", searchController.getSavedSearches);
router.get("/saved-items", searchController.getSavedItems);

module.exports = router;
