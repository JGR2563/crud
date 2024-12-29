const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'crud_db',
    host: process.env.POSTGRES_HOST || 'db',
    port: 5432
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool: pool
};
