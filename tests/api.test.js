/* eslint-disable no-undef */
const { open } = require('sqlite');

const request = require('supertest');

const winston = require('winston');

const sqlite3 = require('sqlite3').verbose();

// Get the function to initalise the app.
const initApp = require('../src/app');

let app;

const buildSchemas = require('../src/schemas');

// Get the helper function to validate form fields of a new ride.
const { validateNewRideInputs } = require('../src/helper');

// Create logger using winston.createLogger.
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Tests
describe('API tests', () => {
  before((done) => {
    // Open the database
    // Docs: https://www.npmjs.com/package/sqlite#opening-the-database
    open({
      // Store database in RAM
      filename: ':memory:',
      driver: sqlite3.Database,
    }).then((db) => {
      // Serialize ensures that only 1 database query can be executed at a time to prevent data corruption.
      db.getDatabaseInstance().serialize((err) => {
        if (err) {
        // Log the error in error.log
          logger.log({
            level: 'error',
            message: err.message,
          });

          return done(err);
        }

        buildSchemas(db);

        // Pass in the database instance and initialise the routes in the express app.
        app = initApp(db);

        // Let Mocha know that the 'before' test is completed.
        done();
      });
    });
  });

  describe('GET /health', () => {
    it('should return health', (done) => {
      request(app)
        .get('/health')
        .expect('Content-Type', /text/)
        .expect(200, done);
    });
  });

  describe('GET /rides', () => {
    it('GET /rides?page=1 should return an array of length equal 3', (done) => {
      request(app)
        .get('/rides?page=1')
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          const arrayLength = response.body.length;

          // If there are 3 rides, pass the test.
          // It is 3 because it is setup this way in ../src/store.js
          if (arrayLength === 3) {
            done();
          } else if (response.body.error_code) {
            // Else throw the error if the app encounters an error
            throw new Error(response.body.error_code);
          } else {
            // Else throw error to catch
            throw new Error('number of rides in page 1 is not 3');
          }
        })
        .catch((err) => {
          // Log the error in error.log
          logger.log({
            level: 'error',
            message: err.message,
          });

          done(err);
        });
    });

    it('GET /rides?page=5 should return the error message - could not find any rides', (done) => {
      request(app)
        .get('/rides?page=5')
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          // If there are 3 rides, pass the test.
          // It is 3 because it is setup this way in ../src/store.js
          if (response.body.error_code === 'RIDES_NOT_FOUND_ERROR') {
            done();
          } else if (response.body.error_code) {
            // Else throw the error if the app encounters another error
            throw new Error(response.body.error_code);
          } else {
            // Else throw error to catch
            throw new Error('Unexpected behaviour in GET /rides?page=5 - no error_code is found in response.');
          }
        })
        .catch((err) => {
          // Log the error in error.log
          logger.log({
            level: 'error',
            message: err.message,
          });

          done(err);
        });
    });

    it('GET /rides?page=hello should return the error message - Page must be an integer', (done) => {
      request(app)
        .get('/rides?page=hello')
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          // If there is a validation error, pass the test.
          if (response.body.error_code === 'VALIDATION_ERROR') {
            done();
          } else if (response.body.error_code) {
            // Else throw the error if the app encounters another error
            throw new Error(response.body.error_code);
          } else {
            // Else throw error to catch
            throw new Error('Unexpected behaviour in GET /rides?page=5 - no error_code is found in response.');
          }
        })
        .catch((err) => {
          // Log the error in error.log
          logger.log({
            level: 'error',
            message: err.message,
          });

          done(err);
        });
    });
  });

  describe('GET /rides/1', () => {
    it('should return an object with rider name = rider1', (done) => {
      request(app)
        .get('/rides/1')
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          // If the response is an array with length 1.
          if (response.body.length === 1) {
            // If rider name is rider1, pass the test.
            if (response.body[0].riderName === 'rider1') {
              done();
            }
          } else if (response.body.error_code) {
            // Else throw the error if the app encounters an error
            throw new Error(response.body.error_code);
          } else {
            // Else throw error to catch
            throw new Error('wrong/no rider found');
          }
        })
        .catch((err) => {
          // Log the error in error.log
          logger.log({
            level: 'error',
            message: err.message,
          });

          done(err);
        });
    });
  });

  describe('POST /rides', () => {
    it('should return newly created ride where riderName = newRider', (done) => {
      const newRide = {
        start_lat: -70,
        start_long: 90,
        end_lat: -75,
        end_long: 95,
        rider_name: 'newRider',
        driver_name: 'newDriver',
        driver_vehicle: 'Toyota',
      };

      request(app)
        .post('/rides')
        .set('Content-Type', 'application/json')
        .send(newRide)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          // If the response is an array with length 1.
          if (response.body.length === 1) {
            // If rider name is newRider, pass the test.
            if (response.body[0].riderName === 'newRider') {
              done();
            } else {
              // If rider name is not newRider, throw error.
              throw new Error(`newly created riderName is not 'newRider' but '${response.body[0].riderName}'`);
            }
          } else if (response.body.error_code) {
            // Else throw the error if the app encounters an error
            throw new Error(response.body.error_code);
          } else {
            // Else throw an error
            throw new Error('wrong/no rider found');
          }
        })
        .catch((err) => {
          // Log the error in error.log
          logger.log({
            level: 'error',
            message: err.message,
          });

          done(err);
        });
    });
  });
});

describe('Validation tests for a new ride', () => {
  describe('Inputs without errors', () => {
    it('returned object should have an error_code == null', (done) => {
      const newRide = {
        start_lat: -70,
        start_long: 90,
        end_lat: -75,
        end_long: 95,
        rider_name: 'newRider',
        driver_name: 'newDriver',
        driver_vehicle: 'Toyota',
      };

      const validationResult = validateNewRideInputs(newRide);

      if (validationResult.error_code !== null) {
        // Log the error in error.log
        logger.log({
          level: 'error',
          message: validationResult.message,
        });

        // Fail the test
        try {
          throw new Error(validationResult.message);
        } catch (err) {
          done(err);
        }
      } else {
        // Pass the test
        done();
      }
    });
  });

  describe('Inputs with errors', () => {
    it('returned object should have an error_code == validation error', (done) => {
      const newRide = {
        start_lat: -70,
        start_long: 90,
        end_lat: -75,
        end_long: 95,
        rider_name: 'newRider',
        driver_name: 1,
        driver_vehicle: 'Toyota',
      };

      const validationResult = validateNewRideInputs(newRide);

      if (validationResult.error_code === 'VALIDATION_ERROR') {
        // Pass the test
        done();
      } else {
        // Log the error in error.log
        logger.log({
          level: 'error',
          message: validationResult.message,
        });

        // Fail the test
        try {
          throw new Error('No validation error detected.');
        } catch (err) {
          done(err);
        }
      }
    });
  });
});
