const http = require("http");

require("dotenv").config();

const app = require("./app");

const { loadPlanetsData } = require("./models/planets.model.js");
const { mongoConnect } = require("./services/mongo.js");
const { loadLaunchesData } = require("./models/launches.model.js");

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

const startServer = async function () {
  await mongoConnect();
  await loadPlanetsData();
  await loadLaunchesData();

  server.listen(PORT, () => console.log(`Listening on ${PORT}...`));
};

startServer();
// const express = require("express");

// const app = express();
// app.listen();

console.log(PORT);
