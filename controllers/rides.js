const store = require('../src/store');

// Get the number of rides per page
const { RIDES_PER_PAGE } = store;

/**
 * Exports a function that contains all database queries to the Rides table
 * @param {object} db - instance of the database
 */
module.exports = (db) => {
  /**
   * Function to add a new ride.
   * @param {array} values - Contains all data related to the new ride to be added.
   */
  async function addNewRide(values) {
    try {
      // Attempt to insert a new ride into the rides table.
      // Using values (2nd argument) automatically sanitises the values.
      const addNewRideResult = await db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)', values);

      return addNewRideResult;
    } catch (error) {
      // If a database error occurred, return an error.
      return {
        error_code: 'SERVER_ERROR',
        message: 'Unknown error',
      };
    }
  }

  /**
   * Function to retrieve data of a ride.
   * @param {string or number} rideId - Id of the ride.
   */
  async function retrieveRide(rideId) {
    try {
      // Query the rides tables for a ride.
      // This statement below uses parameterized queries (i.e. using ? and rideId) to prevent SQL injection.
      const retrieveRideResult = await db.all('SELECT * FROM Rides WHERE rideID = ?', rideId);

      // This statement below does not prevent SQL injection.
      // const retrieveRideResult = await db.all(`SELECT * FROM Rides WHERE rideID = ${rideId}`);

      // If no ride was found, return an error object
      if (retrieveRideResult.length === 0) {
        return {
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides',
        };
      }

      // Return the ride's data.
      return retrieveRideResult;
    } catch (error) {
      // If a database error occurred, return an error.
      return {
        error_code: 'SERVER_ERROR',
        message: 'Unknown error',
      };
    }
  }

  /**
   * Function to retrieve rides data (for a respective page).
   * @param {number} page - Page number.
   */
  async function retrieveRides(page) {
    // Calculate which rideID to begin retrieving rides.
    const startingRideId = (page - 1) * RIDES_PER_PAGE + 1;

    const values = [startingRideId, RIDES_PER_PAGE];

    try {
      // Query the rides table for rides for that page.
      const retrieveRidesResult = await db.all('SELECT * FROM Rides WHERE rideID >= ?1 ORDER BY rideID LIMIT ?2', values);

      // If no ride was found, return an error object
      if (retrieveRidesResult.length === 0) {
        return {
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides',
        };
      }

      // Return the ride's data.
      return retrieveRidesResult;
    } catch (error) {
      // If a database error occurred, return an error.
      return {
        error_code: 'SERVER_ERROR',
        message: 'Unknown error',
      };
    }
  }

  // Return the functions so we can use them in app.js.
  return { addNewRide, retrieveRide, retrieveRides };
};
