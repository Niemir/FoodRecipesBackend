const jwt = require('jsonwebtoken')

const dataFromToken = (token) => {
  const decoded = jwt.decode(token, { complete: true })
  console.log(token)
  if (!decoded) {
    throw new Error('Invalid token')
  }

  return decoded.payload
}
module.exports = dataFromToken
