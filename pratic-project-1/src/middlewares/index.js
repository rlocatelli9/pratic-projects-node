import database from '../database/index.js'

export const validateAccount = (request, response, next) => {
  const {cpf} = request.headers;
  
  const account = database.find(row => row.cpf === cpf)

  if(!account) {
    return response.status(401).json({message: 'Account is not valid'})
  }

  request.account = account

  return next()
}