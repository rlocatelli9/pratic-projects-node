import fastify from 'fastify'
import { parsedEnv } from '../env'
import crypto from 'node:crypto'
import { knex } from '../database'

export const server = fastify()

server.get('/transactions', async () => {
  const transactions = await knex('transactions').select('*')
  return transactions
})

server.post('/transactions', async () => {
  const transaction = await knex('transactions')
    .insert({
      id: crypto.randomUUID(),
      title: 'Transaction of test',
      amount: 100,
    })
    .returning('*')

  return transaction
})

server
  .listen({
    port: parsedEnv.PORT,
  })
  .then(() => {
    console.log(`HTTP Server running on port ${parsedEnv.PORT} ⊱🚀`)
  })
