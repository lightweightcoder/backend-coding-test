/* eslint-disable no-undef */
const request = require('supertest');

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:');

const app = require('../src/app')(db);
const buildSchemas = require('../src/schemas');

describe('API tests', () => {
  before((done) => {
    db.serialize((err) => {
      if (err) {
        return done(err);
      }

      buildSchemas(db);

      // Let Mocha know that the 'before' test is completed.
      done();
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
    it('should return an array of length equal 10', (done) => {
      request(app)
        .get('/rides')
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          const arrayLength = response.body.length;

          // If there are 10 rides, pass the test.
          if (arrayLength === 10) {
            done();
          } else if (response.body.error_code) {
            // Else throw the error if there the app encounters an error
            throw new Error(response.body.error_code);
          } else {
            // Else throw error to catch
            throw new Error('number of rides is not 10');
          }
        })
        .catch((err) => done(err));
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
            // Else throw the error if there the app encounters an error
            throw new Error(response.body.error_code);
          } else {
            // Else throw error to catch
            throw new Error('wrong/no rider found');
          }
        })
        .catch((err) => done(err));
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
          console.log('response body', response.body);
          // If the response is an array with length 1.
          if (response.body.length === 1) {
            // If rider name is newRider, pass the test.
            if (response.body[0].riderName === 'newRider') {
              done();
            }
          } else if (response.body.error_code) {
            // Else throw the error if there the app encounters an error
            throw new Error(response.body.error_code);
          } else {
            // Else throw an error
            throw new Error('wrong/no rider found');
          }
        })
        .catch((err) => done(err));
    });
  });
});
