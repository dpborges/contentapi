const SnakeNamingStrategy = require('typeorm-naming-strategies').SnakeNamingStrategy;
const path = require('path');

const dbConfig = {
  synchronize: false,
  migrations: ['migrations/*.js'],
  cli: {
    migrationsDir: 'migrations',
  },
  namingStrategy: new SnakeNamingStrategy()
};

switch (process.env.NODE_ENV) {
  case 'development':
    Object.assign(dbConfig, {
      synchronize: true,
      logging: false,
      type: 'sqlite',
      database: 'dev.sqlite',
      entities: ['**/*.entity.js'], // in dev mode nest transpiles our ts files to js first; hence we look for entities ending in js
    });
    break;
  case 'test':
    Object.assign(dbConfig, {
      type: 'sqlite',
      database: 'test.sqlite',
      // entities: ['**/*.entity.ts'],  // in test mode ts-jest looks for entities as ts files
      entities: [path.join(__dirname, '**', '*.entity.{ts,js}')],
      migrationsRun: true,    // runs a migration before each of our  tests
      dropSchema: false       // if set to true, it will delete your data after run tests
    });
  break;
  case 'production':
    Object.assign(dbConfig, {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      migrationsRun: true,     // runs a migration to propagate db change to production
      entities: ['**/*.entity.js'],
      ssl: {
        rejectUnauthorized: false, // This is Heroku specific
      }
    });
  default:
    throw new Error('unknown environment')
}

module.exports = dbConfig;