const jwt = require('jsonwebtoken')

const dataFromToken = (token) => {
  const decoded = jwt.decode(token, { complete: true })
  if (!decoded) {
    throw new Error('Invalid token')
  }

  return decoded.payload
}
module.exports = dataFromToken
