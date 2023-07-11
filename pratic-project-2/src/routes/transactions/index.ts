import crypto from 'node:crypto'
import { knex } from '../../database'

import { FastifyInstance } from 'fastify'
import { z as zod } from 'zod'

export async function transactionsRoutes(server: FastifyInstance) {
  server.get('/', async () => {
    const transactions = await knex('transactions').select('*')
    return transactions
  })

  server.post('/', async (request, response) => {
    const createTransactionBodySchema = zod.object({
      title: zod.string(),
      amount: zod.number(),
      type: zod.enum(['credit', 'debit']),
    })
    const { amount, title, type } = createTransactionBodySchema.parse(
      request.body,
    )

    await knex('transactions')
      .insert({
        id: crypto.randomUUID(),
        amount,
        title,
        type,
      })
      .returning('*')

    return response.status(201).send()
  })
}
