const { parse } = require("csv-parse");
const path = require("path");
const fs = require("fs");

const planets = require("./planets.mongo.js");

// const HabitablePlanets = [];

const isHabitablePlanet = function (planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
};

const loadPlanetsData = function () {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler_data.csv")
    )
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          // DONE: Replace below create with insert + update = upsert
          savePlanet(data);
        }
      })
      .on("error", (err) => {
        console.log(err);
        reject(err);
      })
      .on("end", async () => {
        const countFoundPlanets = (await getAllPlanets()).length;
        console.log(`${countFoundPlanets} habitable planets found`);
        resolve();
      });
  });
};

// Creating our document
const savePlanet = async function (planet) {
  try {
    // Updating our planets schema
    await planets.updateOne(
      {
        keplerName: planet.kepler_name,
      },
      {
        keplerName: planet.kepler_name,
      },
      { upsert: true }
    );
  } catch (err) {
    console.error(`Could not save planet ${err}`);
  }
};

const getAllPlanets = async function () {
  return await planets.find(
    {},
    {
      _d: 0,
      __v: 0,
    }
  );
};

module.exports = {
  loadPlanetsData,
  getAllPlanets,
};
