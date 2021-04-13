module.exports = (db) => {
  const createRideTableSchema = `
    CREATE TABLE Rides
    (
    rideID INTEGER PRIMARY KEY AUTOINCREMENT,
    startLat DECIMAL NOT NULL,
    startLong DECIMAL NOT NULL,
    endLat DECIMAL NOT NULL,
    endLong DECIMAL NOT NULL,
    riderName TEXT NOT NULL,
    driverName TEXT NOT NULL,
    driverVehicle TEXT NOT NULL,
    created DATETIME default CURRENT_TIMESTAMP
    )
  `;

  // create the Rides table
  db.run(createRideTableSchema);

  for (let i = 1; i < 11; i += 1) {
    const insertQuery = 'INSERT INTO Rides (startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES($startLat, $startLong, $endLat, $endLong, $riderName, $driverName, $driverVehicle)';

    const values = {
      $startLat: -70 + i,
      $startLong: 90 + i,
      $endLat: -75 + i,
      $endLong: 95 + i,
      $riderName: `rider${i}`,
      $driverName: `driver${i}`,
      $driverVehicle: 'Toyota Prius',
    };

    // seed the ride into the database
    db.run(insertQuery, values);
  }

  return db;
};
