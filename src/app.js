const express = require('express');

const app = express();

const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();

module.exports = (db) => {
  // Route to test if the server is running.
  app.get('/health', (req, res) => res.send('Healthy'));

  // Route to add a ride into the rides table of the database.
  app.post('/rides', jsonParser, (req, res) => {
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

    // Attempt to insert a new ride into the rides table.
    db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values, (err) => {
      // If an error occured, sent an error response.
      if (err) {
        return res.send({
          error_code: 'SERVER_ERROR',
          message: 'Unknown error',
        });
      }

      // Query the rides tables for the newly created ride.
      db.all('SELECT * FROM Rides WHERE rideID = ?', this.lastID, (err, rows) => {
        if (err) {
          return res.send({
            error_code: 'SERVER_ERROR',
            message: 'Unknown error',
          });
        }

        // Send the rides data to the response.
        res.send(rows);
      });
    });
  });

  // Route to retrieve all rides from the database.
  app.get('/rides', (req, res) => {
    // Query the rides table for all rides.
    db.all('SELECT * FROM Rides', (err, rows) => {
      // If an error occured, sent an error response.
      if (err) {
        return res.send({
          error_code: 'SERVER_ERROR',
          message: 'Unknown error',
        });
      }

      // If there are no rides, send an error response.
      if (rows.length === 0) {
        return res.send({
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides',
        });
      }

      // Send the rides data to the response.
      res.send(rows);
    });
  });

  // Route to retrieve a ride from the database.
  app.get('/rides/:id', (req, res) => {
    db.all(`SELECT * FROM Rides WHERE rideID='${req.params.id}'`, (err, rows) => {
      // If an error occured, sent an error response.
      if (err) {
        return res.send({
          error_code: 'SERVER_ERROR',
          message: 'Unknown error',
        });
      }

      // If there are no rides of coressponding to the selected rideId, send an error response.
      if (rows.length === 0) {
        return res.send({
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides',
        });
      }

      // Send the ride data to the response.
      res.send(rows);
    });
  });

  return app;
};
