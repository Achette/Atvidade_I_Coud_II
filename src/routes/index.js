const express = require("express");
const reservesRouter = require("./reserves");

const router = express.Router();

router.use("/reserves", reservesRouter);

module.exports = router;
