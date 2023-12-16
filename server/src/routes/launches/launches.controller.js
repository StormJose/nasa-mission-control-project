const launchesModel = require("../../models/launches.model.js");

const { getPagination } = require("../../services/query.js");

const httpGetAllLaunches = async function (req, res) {
  console.log(req.query);
  // now the magic!
  const { skip, limit } = getPagination(req.query);
  const launches = await launchesModel.getAllLaunches(skip, limit);
  return res.status(200).json(launches);
};

const httpAddNewLaunch = async function (req, res) {
  const launch = req.body;

  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.target ||
    !launch.launchDate
  ) {
    return res.status(400).json({
      error: `Missing required launch property`,
    });
  }

  launch.launchDate = new Date(launch.launchDate);
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: "Invalid launch date",
    });
  }

  await launchesModel.scheduleNewLaunch(launch);
  return res.status(201).json(launch);
};

const httpAbortLaunch = async function (req, res) {
  const launchId = +req.params.id;

  const existsLaunch = await launchesModel.existsLaunchWithId(launchId);
  // if launch doesn't exist.
  if (!existsLaunch) {
    return res.status(404).json({
      error: "Launch not found",
    });
  }

  // If launch oes exist
  const aborted = await launchesModel.abortLaunchById(launchId);
  if (!aborted)
    return res.status(400).json({
      error: "Launch not aborted",
    });
  return res.status(200).json({
    ok: true,
  });
};

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
};
