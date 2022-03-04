// import { rm } from 'fs/promises'; // did not work with nodejs v12
const fs = require('fs');
import { join } from 'path';
import { getConnection } from 'typeorm' ;

// Sets Up Test environment before either each or all tests.
// In our case, we delete test database before all e2e tests. How does our e2e test know to delete the 
// test database? If you look in the test folder, you'll see a file 'jest-e2e.json' file.
// The property "setupFilesAfterEnv" in this file,  tells jest to run the script referenced
// there before all e2e tests or before each e2e test, depending which functions you use below. 
global.beforeAll(async () => {
  const path = join(__dirname, '..', 'test.sqlite');
  // the rm instructor provided in code below did not work in nodejs v12
  // try {
  //   await rm(path);
  // } catch (err) {};

  // replace code above with this code which worked with nodejs v12.
  try {
    console.log("D E L E T I N G    D A T A B A S E")
    fs.unlinkSync(path); //file removed
  } catch(err) {}        //if throws err because file is missing already, then we can run test
});

// Close database connection (close file in case of sqlite), after each e2e test is completed
global.afterAll(async () => {
  const conn = getConnection();
  await conn.close();
})

