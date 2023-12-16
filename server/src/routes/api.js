const express = require("express");

const planetsRouter = require("./planets/planets.router.js");
const launchesRouter = require("./launches/launches.router.js");

const api = express.Router();

api.use("/launches", launchesRouter);
api.use("/planets", planetsRouter);

module.exports = api;
