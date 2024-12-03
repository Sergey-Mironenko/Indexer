require('dotenv/config');
const DataSource = require('typeorm');

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

const dataSource = new DataSource(ormconfig);

dataSource.initialize()
  .then(async con => {
    try {
      // Create schemas
      await con.query(`CREATE SCHEMA IF NOT EXISTS archive`);
      await con.query(`CREATE SCHEMA IF NOT EXISTS indexer`);
      await con.runMigrations({ transaction: 'all' });
    } finally {
      await con.destroy().catch(err => null);  // Используем destroy вместо close
    }
  })
  .then(
    () => process.exit(),
    err => {
      console.error(err, 'ormconfig host: ', ormconfig.host);
      process.exit(1);
    }
  );
