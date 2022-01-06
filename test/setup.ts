// import { rm } from 'fs/promises'; // did not work with nodejs v12
const fs = require('fs');
import { join } from 'path';
import { getConnection } from 'typeorm' ;

// Delete test database before each e2e test
global.beforeEach(async () => {
  const path = join(__dirname, '..', 'test.sqlite');
  // the rm instructor provided in code below did not work in nodejs v12
  // try {
  //   await rm(path);
  // } catch (err) {};

  // replace code above with this code which worked with nodejs v12.
  try {
    fs.unlinkSync(path); //file removed
  } catch(err) {}
});

// Close database connection (close file in case of sqlite), after each e2e test is completed
global.afterEach(async () => {
  const conn = getConnection();
  await conn.close();
})

