# Project goals

This project aims to be a repository for rides, where data related to the driver, rider, vehicle, start and end locations are being stored.

# API

Data can be queried using GET or POST requests. For example, a HTTP-GET request would look something like this: `http://localhost:8010/<route>`.

## Routes

### GET requests

#### 1. health

Tests if the api is running. Responds with the string 'Healthy' if the api is running.

#### 2. rides

Responds with an array of rides stored in the database. A ride object contains the following properties:

- rideID - Integer
  A unique id for the ride.
- startLat - Float
  A float that represents the latitude of the ride's start location.
- startLong - Float
  A float that represents the longitude of the ride's start location.
- endLat - Float
  A float that represents the latitude of the ride's end location.
- endLong - Float
  A float that represents the longitude of the ride's end location.
- riderName - String
  The rider's name.
- driverName - String
  The driver's name.
- driverVehicle - String
  The diver's vehicle name.
- created - String
  A date string that is created automatically where the date is the creation date of that ride.

##### Example ride object

```
{
"rideID": 1,
"startLat": -80,
"startLong": 90,
"endLat": -75,
"endLong": 95,
"riderName": "rider1",
"driverName": "driver1",
"driverVehicle": "Toyota Prius",
"created": "2021-04-10 17:11:09"
}
```

If no rides are in the database, responds with the following object:

```
{
  error_code: 'RIDES_NOT_FOUND_ERROR',
  message: 'Could not find any rides'
}
```

If a database error occured, responds with the following:

```
{
 error_code: 'SERVER_ERROR',
 message: 'Unknown error'
}
```

#### 3. rides/:id

Responds with a ride object of the rideID equal to the 'id' query parameter.

If no rides are in the database, responds with the following object:

```
{
  error_code: 'RIDES_NOT_FOUND_ERROR',
  message: 'Could not find any rides'
}
```

If a database error occured, responds with the following:

```
{
 error_code: 'SERVER_ERROR',
 message: 'Unknown error'
}
```

### POST requests

#### 1. rides

Attempt to add a new ride data to the database and return all columns of the newly created data.

##### Post body example

```
{
"start_lat": -80,
"start_long": 90,
"end_lat": -75,
"end_long": 95,
"rider_name": "rider1",
"driver_name": "driver1",
"driver_vehicle": "Toyota Prius",
}
```

##### Contraints

- start_lat and end_lat must be in the range of -90 and 90.
- start_long and end_long must be in the range of -180 and 180.
- rider_name, driver_name, and driver_vehicle must be a non-empty string.

Failing any of the constraints above will result in the response:

```
{
  error_code: 'VALIDATION_ERROR',
  message: 'Rider name must be a non empty string'
}
```

If a database error occured, responds with the following:

```
{
 error_code: 'SERVER_ERROR',
 message: 'Unknown error'
}
```
