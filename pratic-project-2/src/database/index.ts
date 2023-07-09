import { knex as setupKnex, Knex } from 'knex'
import { parsedEnv } from '../env'

export const configDatase: Knex.Config = {
  client: parsedEnv.DATABASE_CLIENT,
  connection: {
    filename: parsedEnv.DATABASE_URL,
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './src/database/migrations',
  },
}
export const knex = setupKnex(configDatase)
