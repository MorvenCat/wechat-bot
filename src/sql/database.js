import knex from 'knex'
import knexConfig from './knexfile.js'

const db = knex(knexConfig)

export async function initializeDatabase() {
  const tables = [
    {
      name: 'rssWatchList',
      create: (table) => {
        table.increments('id').primary()
        table.string('rss').unique()
      },
    },
    {
      name: 'AliasWhiteList',
      create: (table) => {
        table.increments('id').primary()
        table.string('alias').unique()
      },
    },
    {
      name: 'RoomWhiteList',
      create: (table) => {
        table.increments('id').primary()
        table.string('roomName').unique()
      },
    },
    {
      name: 'lastUpdate',
      create: (table) => {
        table.increments('id').primary()
        table.string('rssUrl').unique()
        table.timestamp('lastUpdate')
      },
    },
    {
      name: 'latestContent',
      create: (table) => {
        table.increments('id').primary()
        table.string('rssUrl').unique()
        table.text('content')
      },
    },
  ]

  try {
    await Promise.all(
      tables.map(async ({ name, create }) => {
        const exists = await db.schema.hasTable(name)
        if (!exists) {
          await db.schema.createTable(name, create)
        }
      }),
    )
    console.log('Database initialized successfully.')
  } catch (error) {
    console.error('Error initializing database:', error)
  }
}

export default db
