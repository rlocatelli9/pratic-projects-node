import fastify from 'fastify'
import { parsedEnv } from '../env'
import { transactionsRoutes } from '../routes/transactions'
import cookie from '@fastify/cookie'

export const server = fastify()

server.register(cookie)

server.register(transactionsRoutes, {
  prefix: 'transactions',
})

server
  .listen({
    port: parsedEnv.PORT,
  })
  .then(() => {
    console.log(`HTTP Server running on port ${parsedEnv.PORT} ⊱🚀`)
  })
