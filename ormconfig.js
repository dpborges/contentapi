const dbConfig = {
  synchronize: false,
  migrations: ['migrations/*.js'],
    cli: {
      migrationsDir: 'migrations',
    },
};

switch (process.env.NODE_ENV) {
  case 'development':
    Object.assign(dbConfig, {
      synchronize: true,
      type: 'sqlite',
      database: 'dev.sqlite',
      entities: ['**/*.entity.js'], // in dev mode nest transpiles our ts files to js first; hence we look for entities ending in js
    });
    break;
  case 'test':
    Object.assign(dbConfig, {
      type: 'sqlite',
      database: 'test.sqlite',
      entities: ['**/*.entity.ts'],  // in test mode ts-jest looks for entities as ts files
      migrationsRun: true,     // runs a migration for each of our individual tests
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