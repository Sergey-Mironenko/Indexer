require('dotenv/config');
const { DataSource } = require('typeorm');

const ormconfig = {
  type: 'postgres',
  entities: [],
  migrations: [__dirname + '/migrations/*.js'],
  synchronize: true,
  migrationsRun: true,
  dropSchema: true,
  logging: ["query", "error", "schema"],
  host: "dpg-ct6bvabv2p9s739aq600-a.oregon-postgres.render.com",
  port: 5432,
  database: "postgress_4sgg",
  username: "postgress",
  password: "YzHGemWnJKdIN53Lnxv6aPsW63TriqrG",
  ssl: { rejectUnauthorized: false },
};

console.log('ormconfig host: ', ormconfig.host);

const dataSource = new DataSource(ormconfig);

dataSource.initialize()
  .then(async con => {
    try {
      console.log('Database connection established');
      // Create schemas
      await con.query(`CREATE SCHEMA IF NOT EXISTS archive`);
      await con.query(`CREATE SCHEMA IF NOT EXISTS indexer`);
      await con.runMigrations({ transaction: 'all' });
    } finally {
      await con.destroy().catch(err => console.error('Error closing connection:', err));  // Используем destroy вместо close
    }
  })
  .then(
    () => {
      console.log('Initialization complete');
      process.exit();
    },
    err => {
      console.error('Error occurred during database initialization:', err);
      console.error('ormconfig host: ', ormconfig.host);
      process.exit(1);
    }
  );
