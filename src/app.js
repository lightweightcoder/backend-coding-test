/* eslint-disable func-names */
const express = require('express');

const app = express();

const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();

// Get the function to initalise the rides controller.
// The rides controller performs database queries.
const initRidesController = require('../controllers/rides.js');

module.exports = (db) => {
  // initialise the controllers
  const ridesController = initRidesController(db);

  // Route to test if the server is running.
  app.get('/health', (req, res) => res.send('Healthy'));

  // Route to add a ride into the rides table of the database.
  app.post('/rides', jsonParser, async (req, res) => {
    // Get the ride details from the request body
    const startLatitude = Number(req.body.start_lat);
    const startLongitude = Number(req.body.start_long);
    const endLatitude = Number(req.body.end_lat);
    const endLongitude = Number(req.body.end_long);
    const riderName = req.body.rider_name;
    const driverName = req.body.driver_name;
    const driverVehicle = req.body.driver_vehicle;

    /**
     * Return an error code and message if start latitude or/and longitude are not
     * between -90 - 90 and -180 to 180 degrees respectively.
     */
    if (startLatitude < -90 || startLatitude > 90 || startLongitude < -180 || startLongitude > 180) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
      });
    }

    /**
     * Return an error code and message if end latitude or/and longitude are not
     * between -90 - 90 and -180 to 180 degrees respectively.
     */
    if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
      });
    }

    // Return an error and message if rider name is not a string or an empty string.
    if (typeof riderName !== 'string' || riderName.length < 1) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Rider name must be a non empty string',
      });
    }

    // Return an error and message if driver name is not a string or an empty string.
    if (typeof driverName !== 'string' || driverName.length < 1) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Rider name must be a non empty string',
      });
    }

    // Return an error and message if vehicle is not a string or an empty string.
    if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Rider name must be a non empty string',
      });
    }

    const values = [req.body.start_lat, req.body.start_long, req.body.end_lat, req.body.end_long, req.body.rider_name, req.body.driver_name, req.body.driver_vehicle];

    // Add a new ride to rides table
    const addNewRideResult = await ridesController.addNewRide(values);

    // If there is an error, send it to the response
    if (addNewRideResult.error_code) {
      return res.send(addNewRideResult);
    }

    // If there is no error, get the rideID of the new ride
    const newRideId = addNewRideResult.lastID;

    // Retrieve the ride's data
    const retrieveRideResult = await ridesController.retrieveRide(newRideId);

    // Return the retrieved result.
    return res.send(retrieveRideResult);
  });

  // Route to retrieve all rides of a single page from the database.
  app.get('/rides', async (req, res) => {
    // Get the page number from query parameter.
    // If req.query.page is not a number, page == NaN
    // If req.query.page is an empty string or null, page == 0
    const page = Number(req.query.page);

    // If page is not a number, return a validation error message
    if (Number.isNaN(page) || page === 0) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Page must be an integer',
      });
    }

    // Retrieve the rides data for that page.
    const retrieveRidesResult = await ridesController.retrieveRides(page);

    // Return the retrieved result.
    return res.send(retrieveRidesResult);
  });

  // Route to retrieve a ride from the database.
  app.get('/rides/:id', async (req, res) => {
    // Retrieve the ride's data
    const retrieveRideResult = await ridesController.retrieveRide(req.params.id);

    // Return the retrieved result.
    return res.send(retrieveRideResult);
  });

  return app;
};
