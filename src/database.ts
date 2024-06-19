import { knex as setupKnex } from 'knex'
import { env } from './env'

export const config = {
  client: env.DATABASE_CLIENT,
  connection: {
    filename: env.DATABASE_URL,
  },
  useNullAsDefault: true,
}

export const knex = setupKnex(config)
