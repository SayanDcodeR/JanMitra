const express = require("express");
const router = express.Router();
const mapsController = require("../controllers/maps.controller");

router.post("/forward-geocode", mapsController.forwardGeocode);
router.post("/search-by-location", mapsController.searchIssuesByLocation);
router.get("/data", mapsController.getMapData);

module.exports = router;
