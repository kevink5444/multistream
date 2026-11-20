/* =========================================================
   DESTINATION SERVICE
   ========================================================= */

/*
  Temporary storage for streaming destinations.

  Data ini masih disimpan di memory.
  Jika backend restart, data akan kembali ke data awal.
*/

let destinations = [
  {
    id: 1,
    name: "YouTube",
    platform: "youtube",
    status: "connected",
    streamKey: "",
    streamUrl: "rtmp://a.rtmp.youtube.com/live2",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Twitch",
    platform: "twitch",
    status: "connected",
    streamKey: "",
    streamUrl: "rtmp://live.twitch.tv/app",
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Facebook Live",
    platform: "facebook",
    status: "pending",
    streamKey: "",
    streamUrl: "rtmps://live-api-s.facebook.com:443/rtmp",
    createdAt: new Date().toISOString(),
  },
];

/* =========================================================
   GET ALL DESTINATIONS
   ========================================================= */

const getAllDestinations = () => {
  return destinations;
};

/* =========================================================
   GET DESTINATION BY ID
   ========================================================= */

const getDestinationById = (id) => {
  return destinations.find(
    (destination) => destination.id === Number(id)
  );
};

/* =========================================================
   CREATE DESTINATION
   ========================================================= */

const createDestination = (data) => {
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

  return newDestination;
};

/* =========================================================
   UPDATE DESTINATION
   ========================================================= */

const updateDestination = (id, data) => {
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

  return destinations[destinationIndex];
};

/* =========================================================
   DELETE DESTINATION
   ========================================================= */

const deleteDestination = (id) => {
  const destinationIndex = destinations.findIndex(
    (destination) => destination.id === Number(id)
  );

  if (destinationIndex === -1) {
    return null;
  }

  const deletedDestination = destinations[destinationIndex];

  destinations.splice(destinationIndex, 1);

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