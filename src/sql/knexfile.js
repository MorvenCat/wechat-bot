// knexfile.js
import dotenv from 'dotenv'

dotenv.config()

const dbType = process.env.DB_TYPE || 'sqlite'

const knexConfig = {
  sqlite: {
    client: 'sqlite3',
    connection: {
      filename: './bot.db',
    },
    useNullAsDefault: true,
  },
  mysql: {
    client: 'mysql',
    connection: {
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    },
  },
}

export default knexConfig[dbType]
