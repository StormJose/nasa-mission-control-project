const axios = require("axios");

const launchesDatabase = require("./launches.mongo.js");
const planets = require("./planets.mongo");

// const launches = new Map();

const DEFAULT_FLIGHT_NUMBER = 100;

// const launch = {
//   flightNumber: 100, // flight_number
//   launchDate: new Date("December 27, 2030"), // date_local
//   mission: "Kepler Exploration X", // name
//   rocket: "Explorer IS1", // rocket.name
//   target: "Kepler-442 b", // not applicable
//   customers: ["ZTM", "NASA"], // payload.customers for each payload
//   upcoming: true, // upcoming
//   success: true, // success
// };

const saveLaunch = async function (launch) {
  await launchesDatabase.findOneAndUpdate(
    // conditions, update, options
    {
      flightNumber: launch.flightNumber,
    },
    {
      ...launch,
    },
    {
      upsert: true,
    }
  );
};

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

const populateLaunches = async function () {
  console.log("Downloading launch data...");
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.log("Problem downloading launch data");
    throw new Error("Launch data download failed");
  }

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => {
      return payload["customers"];
    });

    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      customers,
    };

    console.log(`${launch.flightNumber} ${launch.mission}`);

    //DONE: populate launches collection...

    await saveLaunch(launch);
  }
};

const loadLaunchesData = async function () {
  // only one of them is enough
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });

  if (firstLaunch) {
    console.log("Launch data already loaded!");
  } else {
    populateLaunches();
  }
};

const findLaunch = async function (filter) {
  return await launchesDatabase.findOne(filter);
};

const existsLaunchWithId = async function (launchId) {
  return await findLaunch({ flightNumber: launchId });
};

const getAllLaunches = async function (skip, limit) {
  return await launchesDatabase
    .find({}, { _id: 0, __v: 0 })
    .skip(skip)
    .limit(limit)
    .sort("flightNumber");
};

const getLatestFlightNumber = async function () {
  // sort "-" indicates sorting in the ascending order
  const latestLaunch = await launchesDatabase.findOne().sort("-flightNumber");

  if (!latestLaunch) return DEFAULT_FLIGHT_NUMBER;

  return latestLaunch.flightNumber;
};

const scheduleNewLaunch = async function (launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });

  if (!planet) {
    throw new Error("No matching planet found");
  }

  const newFlightNumber = (await getLatestFlightNumber()) + 1;

  const newLaunch = Object.assign(launch, {
    upcoming: true,
    success: true,
    customers: ["Zero to Mastery", "NASA"],
    flightNumber: newFlightNumber,
  });
  await saveLaunch(newLaunch);
};

/* const addNewLaunch = function (launch) {
  latestFlightNumber++;
  launchesDatabase.set(
    latestFlightNumber,
    Object.assign(launch, {
      flightNumber: latestFlightNumber,
      customers: ["Zero to Mastery", "NASA"],
      upcoming: true,
      success: true,
    })
  );
}; */

const abortLaunchById = async function (launchId) {
  const aborted = await launchesDatabase.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    }
  );

  return aborted.ok === 1 && aborted.modifiedCount === 1;

  // const aborted = launches.get(launchId);
  // aborted.upcoming = false;
  // aborted.success = false;
  // return aborted;
};

module.exports = {
  loadLaunchesData,
  existsLaunchWithId,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
};
