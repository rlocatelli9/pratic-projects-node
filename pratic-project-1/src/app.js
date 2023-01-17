import express from 'express';
import {randomUUID} from 'node:crypto'

import accounts from './database/index.js';
import { validateAccount } from './middlewares/index.js';

const app = express();
app.use(express.json());


app.get('/accounts', (request, response) => {
  response.status(200).json(accounts)
})

app.get('/accounts/:id', (request, response) => {
  const { id} = request.params
  const account = accounts.find(row => row.uuid === id)

  if(!account) {
    return response.status(404).json({message: 'Account not found'})
  }

  return response.status(200).json(account)
})

/**
 * CPF - String
 * name - String
 * uuid - String
 * statement - Array history of account
 */
app.post('/accounts', (request, response) => {
  const { cpf, name, amount } = request.body
  const accountIndex = accounts.findIndex(row => row.cpf === cpf)

  if(accountIndex === -1) {
    const newAccount = Object.assign({}, {uuid: randomUUID(), cpf, name, amount: amount || 0, statement: []})
    accounts.push(newAccount)
    return response.status(204).end()
  }

  return response.status(401).json({message: 'Invalid credentials. The CPF already exists.'})

})

app.get('/statements', validateAccount, (request, response) => {
  const { account } = request
  const { type } = request.query

  if(type){
    const statementsByType = account.statement.reduce((acc, current) => {
      if(current.type === type){
        return [...acc, current]
      }
      return acc
    }, []) 

    return response.status(200).json(statementsByType)
  }

  return response.status(200).json(account.statement)
})

app.get('/statements/date', validateAccount, (request, response) => {
  const { account } = request
  const { date } = request.query

  if(!date){
    return response.status(401).json({message: 'date is missing'})
  }

  const dateFormatted = new Date(date + " 00:00")

  const filteredStatements = account.statement.filter((item) => item.createdAt.toDateString() === new Date(dateFormatted).toDateString())

  return response.status(200).json(filteredStatements)
})

app.post('/deposit', validateAccount, (request, response) => {
  const {description, amount} = request.body
  const {account} = request

  const statementOperations = {description, amount, createdAt: new Date(), type: "credit",}

  account.amount += amount

  account.statement.push(statementOperations)

  return response.status(200).json(account)
})

app.post('/withdraw', validateAccount, (request, response) => {
  const {description, amount} = request.body
  const {account} = request

  if(account.amount < amount) {
    return response.status(401).json({message: 'Is not a valid. No have amount for this operation.'})
  }

  account.amount -= amount

  const statementOperations = {description, amount, createdAt: new Date(), type: "debit",}
  account.statement.push(statementOperations)


  return response.status(200).json(account)
})

app.put('/account', validateAccount, (request, response) => {
  const {account} = request
  const {cpf, name} = request.body

  if(cpf && account.cpf !== cpf) {
    const isExists = accounts.some(row => row.cpf === cpf)
    if(isExists) {
      return response.status(401).json({ message: 'The CPF is already in use.'})
    }
  }

  const accountIndex = accounts.findIndex(row => row.cpf === account.cpf)
  if(accountIndex !== -1) {
    accounts[accountIndex] = {
      ...account,
      cpf: cpf ? cpf : account.cpf,
      name: name ? name : account.name,
    }

    return response.status(200).json(accounts[accountIndex])
  }
  

})

app.delete('/account', validateAccount, (request, response) => {
  const {account} = request
  const {cpf} = request.headers

  const isExists = accounts.some(row => row.cpf === cpf)
  
  if(isExists) {
    accounts.splice(account, 1)

    return response.status(204)
  }

  return response.status(401).json({ message: 'Account not found.'})

})


export default app