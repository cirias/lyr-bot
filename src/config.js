const env = process.env.NODE_ENV || 'deployment';

const config = {
  deployment: {
    logLevel: 'debug',
    token: process.env.BOT_TOKEN,
    master: process.MASTER_ID,
    port: 8000,
    db: {
      host: '127.0.0.1',
      database: 'lyr',
      username: 'postgres',
      password: '11235',
    },
  },
  production: {
    logLevel: process.env.LOG_LEVEL || 'info',
    token: process.env.BOT_TOKEN,
    master: process.MASTER_ID,
    port: 8080,
    db: {
      host: 'postgres',
      database: 'lyr',
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
    },
  },
};

export default config[env];
