import crypto from 'node:crypto'
import { knex } from '../../database'

import { FastifyInstance } from 'fastify'
import { z as zod } from 'zod'

export async function transactionsRoutes(server: FastifyInstance) {
  server.get('/', async (_, response) => {
    const transactions = await knex('transactions').select('*')
    return response.status(200).send({
      transactions,
      total: transactions.length,
    })
  })

  server.get('/:id', async (request, response) => {
    const getTransactionParamsSchema = zod.object({
      id: zod.string().uuid(),
    })

    const { id } = getTransactionParamsSchema.parse(request.params)

    const transaction = await knex('transactions').where({ id }).first()

    return response.status(200).send(transaction)
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
