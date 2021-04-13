const { open } = require('sqlite');

const port = 8010;

const sqlite3 = require('sqlite3').verbose();

const buildSchemas = require('./src/schemas');

// Run this async function.
(async () => {
  // Open the database
  // Docs: https://www.npmjs.com/package/sqlite#opening-the-database
  const createDatabase = await open({
  // Store database in RAM
    filename: ':memory:',
    driver: sqlite3.Database,
  });

  // Serialize ensures that only 1 database query can be executed at a time to prevent data corruption.
  createDatabase.getDatabaseInstance().serialize(() => {
    buildSchemas(createDatabase);

    // eslint-disable-next-line global-require
    const app = require('./src/app')(createDatabase);

    app.listen(port, () => console.log(`App started and listening on port ${port}`));
  });
})();
