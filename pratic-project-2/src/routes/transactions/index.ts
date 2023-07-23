import crypto from 'node:crypto'
import { knex } from 'database'

import { FastifyInstance } from 'fastify'
import { z as zod } from 'zod'
import { checkSessionIdExists } from 'middlewares/check-session-id-exists'

export async function transactionsRoutes(server: FastifyInstance) {
  server.get(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request, response) => {
      const sessionId = request.cookies.sessionId

      const transactions = await knex('transactions')
        .where('session_id', sessionId)
        .select('*')
      return response.status(200).send({
        transactions,
        total: transactions.length,
      })
    },
  )

  server.get(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, response) => {
      const getTransactionParamsSchema = zod.object({
        id: zod.string().uuid(),
      })

      const { id } = getTransactionParamsSchema.parse(request.params)

      const transaction = await knex('transactions').where({ id }).first()

      return response.status(200).send(transaction)
    },
  )

  server.get(
    '/summary',
    { preHandler: [checkSessionIdExists] },
    async (request, response) => {
      const sessionId = request.cookies.sessionId

      const summary = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount', { as: 'amount' })
        .first()
      return response.status(200).send({ summary })
    },
  )

  server.post('/', async (request, response) => {
    const createTransactionBodySchema = zod.object({
      title: zod.string(),
      amount: zod.number(),
      type: zod.enum(['credit', 'debit']),
    })
    const { amount, title, type } = createTransactionBodySchema.parse(
      request.body,
    )

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = crypto.randomUUID()

      response.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7days in miliseconds
      })
    }

    if (type === 'credit' && !(amount > 0)) {
      return response.status(401).send({
        error: 'This action is not authorized',
      })
    }

    if (type === 'debit' && !(amount < 0)) {
      return response.status(401).send({
        error: 'This action is not authorized',
      })
    }

    await knex('transactions')
      .insert({
        id: crypto.randomUUID(),
        amount,
        title,
        type,
        session_id: sessionId,
      })
      .returning('*')

    return response.status(201).send()
  })
}
