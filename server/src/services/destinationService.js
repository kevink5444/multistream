/* =========================================================
   DESTINATION SERVICE
   ========================================================= */

const fs = require("fs");
const path = require("path");

/* =========================================================
   DATA STORAGE
   ========================================================= */

const dataPath = path.join(__dirname, "../data/destinations.json");

/* =========================================================
   READ DESTINATIONS
   ========================================================= */

const readDestinations = () => {
  const data = fs.readFileSync(dataPath, "utf8");

  return JSON.parse(data);
};

/* =========================================================
   SAVE DESTINATIONS
   ========================================================= */

const saveDestinations = (destinations) => {
  fs.writeFileSync(
    dataPath,
    JSON.stringify(destinations, null, 2),
    "utf8"
  );
};

/* =========================================================
   GET ALL DESTINATIONS
   ========================================================= */

const getAllDestinations = () => {
  return readDestinations();
};

/* =========================================================
   GET DESTINATION BY ID
   ========================================================= */

const getDestinationById = (id) => {
  const destinations = readDestinations();

  return destinations.find(
    (destination) => destination.id === Number(id)
  );
};

/* =========================================================
   CREATE DESTINATION
   ========================================================= */

const createDestination = (data) => {
  const destinations = readDestinations();

  const newDestination = {
    id:
      destinations.length > 0
        ? Math.max(...destinations.map((destination) => destination.id)) + 1
        : 1,

    name: data.name,
    platform: data.platform,
    status: data.status || "pending",
    streamKey: data.streamKey || "",
    streamUrl: data.streamUrl || "",
    createdAt: new Date().toISOString(),
  };

  destinations.push(newDestination);

  saveDestinations(destinations);

  return newDestination;
};

/* =========================================================
   UPDATE DESTINATION
   ========================================================= */

const updateDestination = (id, data) => {
  const destinations = readDestinations();

  const destinationIndex = destinations.findIndex(
    (destination) => destination.id === Number(id)
  );

  if (destinationIndex === -1) {
    return null;
  }

  destinations[destinationIndex] = {
    ...destinations[destinationIndex],
    ...data,
    id: Number(id),
  };

  saveDestinations(destinations);

  return destinations[destinationIndex];
};

/* =========================================================
   DELETE DESTINATION
   ========================================================= */

const deleteDestination = (id) => {
  const destinations = readDestinations();

  const destinationIndex = destinations.findIndex(
    (destination) => destination.id === Number(id)
  );

  if (destinationIndex === -1) {
    return null;
  }

  const deletedDestination = destinations[destinationIndex];

  destinations.splice(destinationIndex, 1);

  saveDestinations(destinations);

  return deletedDestination;
};

/* =========================================================
   EXPORT SERVICE
   ========================================================= */

module.exports = {
  getAllDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
};