const express = require("express");

const { httpGetAllPlanets } = require("./planets.controller.js");

const planetsRouter = express.Router();

planetsRouter.get("/", httpGetAllPlanets);

module.exports = planetsRouter;
