/* eslint-disable func-names */
const express = require('express');

const app = express();

const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();

// Get the function to initalise the rides controller.
// The rides controller performs database queries.
const initRidesController = require('../controllers/rides.js');

// Get the helper function to validate form fields of a new ride.
const { validateNewRideInputs } = require('./helper');

module.exports = (db) => {
  // initialise the controllers
  const ridesController = initRidesController(db);

  // Route to test if the server is running.
  app.get('/health', (req, res) => res.send('Healthy'));

  // Route to add a ride into the rides table of the database.
  app.post('/rides', jsonParser, async (req, res) => {
    // Validate the form fields of the new ride to be added.
    const validationResult = validateNewRideInputs(req.body);

    // If there is a validation error, return the error object to the response
    if (validationResult.error_code) {
      return res.send(validationResult);
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
