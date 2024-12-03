require('dotenv/config');
const waitPort = require('wait-port');
const { createConnection } = require('typeorm');

const ormconfig = {
  type: 'postgres',
  entities: [],
  migrations: [__dirname + '/migrations/*.js'],
  synchronize: false,
  migrationsRun: false,
  dropSchema: false,
  logging: ['query', 'error', 'schema'],
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  database: process.env.DB_NAME || 'postgres',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  ssl: { rejectUnauthorized: false },
};

const waitForDatabase = async () => {
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT;

  console.log(`Waiting for database at ${host}:${port}...`);

  const isAvailable = await waitPort({ host, port });
  if (isAvailable) {
    console.log('Database is available!');
  } else {
    console.error('Database is not available after waiting');
    process.exit(1);
  }
};

const initialize = async () => {
  try {
    // Log environment variables to check if they're correct
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_PORT:', process.env.DB_PORT);
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log('DB_USER:', process.env.DB_USER);

    // Wait for the database to be ready
    await waitForDatabase();

    // Create the connection to the database
    const connection = await createConnection(ormconfig);

    try {
      // Create schemas if not exists
      await connection.query('CREATE SCHEMA IF NOT EXISTS archive');
      await connection.query('CREATE SCHEMA IF NOT EXISTS indexer');

      // Run migrations
      console.log('Running migrations...');
      await connection.runMigrations({ transaction: 'all' });
      console.log('Migrations completed successfully');
    } finally {
      await connection.close().catch(err => null);
    }
  } catch (err) {
    console.error('Error during initialization:', err);
    process.exit(1);
  } finally {
    process.exit();
  }
};

initialize();
