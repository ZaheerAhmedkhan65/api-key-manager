const express = require("express");
const router = express.Router();
const apiKeyAuth = require("../middlewares/apiKeyAuth");

router.get("/data", apiKeyAuth, (req, res) => {
    res.json({
        message: "Secret data accessed successfully!",
        owner: req.apiUser
    });
});

module.exports = router;