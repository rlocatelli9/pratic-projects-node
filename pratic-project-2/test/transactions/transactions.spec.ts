import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'

import { app } from 'app'

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest ')
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

  it('should be able to list all transactions', async () => {
    const transactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 200,
        type: 'credit',
      })

    const cookies = transactionResponse.get('Set-Cookie')

    const transactionList = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)

    expect(transactionList.body.transactions).toEqual([
      expect.objectContaining({
        title: 'New transaction',
        amount: 200,
        type: 'credit',
      }),
    ])
  })
})
