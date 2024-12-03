require('dotenv/config');

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
