import { afterAll, beforeAll, describe, it } from 'vitest'
import request from 'supertest'

import { app } from 'app'

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to create a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 100,
        type: 'debit',
      })
      .expect(201)
  })
})
