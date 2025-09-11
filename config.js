require('dotenv').config();//instatiate environment variables

let config = {} //Make this global to use all over the application

config.app          = process.env.APP   || 'dev';
config.port         = process.env.PORT  || '2000';
// config.Api_Url         = 'http://greenplay.azurewebsites.net/';
config.Api_Url         = 'https://defisansautosolo.greenplay.social';

// config.db_host      = process.env.DB_HOST       || 'localhost';
// config.db_name      = process.env.DB_NAME       || 'greenplaydb';
// config.db_user      = process.env.DB_USER       || 'greenplay';
// config.db_password  = process.env.DB_PASSWORD   || 'Bgl897!!';

config.db_host      = process.env.DB_HOST       || 'localhost';
config.db_name      = process.env.DB_NAME       || 'greenplay';
config.db_user      = process.env.DB_USER       || 'sunil';
config.db_password  = process.env.DB_PASSWORD   || 'sunil';

config.secret_key  = 'greenplay';
config.jwt_encryption  = process.env.JWT_ENCRYPTION || 'jwt_please_change';
config.jwt_expiration  = process.env.JWT_EXPIRATION || '10000';

module.exports = config;