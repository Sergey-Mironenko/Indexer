require('dotenv/config');

const ormconfig = {
  type: 'postgres',
  entities: [],
  migrations: [__dirname + '/migrations/*.js'],
  synchronize: true,
  migrationsRun: true,
  dropSchema: false,
  logging: ["query", "error", "schema"],
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  ssl: { rejectUnauthorized: false },
};

require('typeorm').createConnection(ormconfig).then(async con => {
  try {
    // Create schemas
    await con.query(`CREATE SCHEMA IF NOT EXISTS archive`);
    await con.query(`CREATE SCHEMA IF NOT EXISTS indexer`);
    await con.runMigrations({ transaction: 'all' });
  } finally {
    await con.close().catch(err => null);
  }
}).then(
  () => process.exit(),
  err => {
    console.error(err);
    process.exit(1);
  }
);
