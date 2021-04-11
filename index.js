const port = 8010;

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:');

const buildSchemas = require('./src/schemas');

// Serialize ensures that only 1 database query can be executed at a time to prevent data corruption.
db.serialize(() => {
  buildSchemas(db);

  // eslint-disable-next-line global-require
  const app = require('./src/app')(db);

  app.listen(port, () => console.log(`App started and listening on port ${port}`));
});
