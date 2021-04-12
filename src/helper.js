/**
 * Function to validate user input form fields of a new ride.
 * @param {object} ride - Contains all data related to the new ride to be added.
 */
function validateNewRideInputs(ride) {
  // Get the ride details from the request body
  const startLatitude = Number(ride.start_lat);
  const startLongitude = Number(ride.start_long);
  const endLatitude = Number(ride.end_lat);
  const endLongitude = Number(ride.end_long);
  const riderName = ride.rider_name;
  const driverName = ride.driver_name;
  const driverVehicle = ride.driver_vehicle;

  /**
     * Return an error code and message if start latitude or/and longitude are not
     * between -90 - 90 and -180 to 180 degrees respectively.
     */
  if (startLatitude < -90 || startLatitude > 90 || startLongitude < -180 || startLongitude > 180) {
    return {
      error_code: 'VALIDATION_ERROR',
      message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
    };
  }

  /**
     * Return an error code and message if end latitude or/and longitude are not
     * between -90 - 90 and -180 to 180 degrees respectively.
     */
  if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
    return {
      error_code: 'VALIDATION_ERROR',
      message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
    };
  }

  // Return an error and message if rider name is not a string or an empty string.
  if (typeof riderName !== 'string' || riderName.length < 1) {
    return {
      error_code: 'VALIDATION_ERROR',
      message: 'Rider name must be a non empty string',
    };
  }

  // Return an error and message if driver name is not a string or an empty string.
  if (typeof driverName !== 'string' || driverName.length < 1) {
    return {
      error_code: 'VALIDATION_ERROR',
      message: 'Driver name must be a non empty string',
    };
  }

  // Return an error and message if vehicle is not a string or an empty string.
  if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
    return {
      error_code: 'VALIDATION_ERROR',
      message: 'Rider name must be a non empty string',
    };
  }

  // If all validations passed, return null.
  return {
    error_code: null,
  };
}

module.exports.validateNewRideInputs = validateNewRideInputs;
