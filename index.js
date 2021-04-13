const { open } = require('sqlite');

const port = 8010;

const sqlite3 = require('sqlite3').verbose();

// const db = new sqlite3.Database(':memory:');

const buildSchemas = require('./src/schemas');

// Open the database
// Docs: https://www.npmjs.com/package/sqlite#opening-the-database
open({
  // Store database in RAM
  filename: ':memory:',
  driver: sqlite3.Database,
}).then(async (db) => {
  // Serialize ensures that only 1 database query can be executed at a time to prevent data corruption.
  db.getDatabaseInstance().serialize(() => {
    buildSchemas(db);

    // eslint-disable-next-line global-require
    const app = require('./src/app')(db);

    app.listen(port, () => console.log(`App started and listening on port ${port}`));
  });
});
