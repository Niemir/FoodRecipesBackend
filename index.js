if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express')
const redis = require('redis')
const client = redis.createClient({
  url: `redis://${process.env.USERNAME_DB}:${process.env.PASSWORD}@${process.env.HOST}:${process.env.PORT}`,
})
const app = express()
client.connect()

app.get('/api', async (req, res) => {
  try {
    client.set('asyncGet', 'value2 ')
    // redisClient.get("apiQuotes", async (err, quotes) => {
    //   if (quotes) {
    //     res.send(quotes);
    //   } else {
    //     const getQuotes = await axios.get(
    //       `https://www.breakingbadapi.com/api/quotes`
    //     );
    //     const { data: quotes } = getQuotes;
    //     redisClient.setex("apiQuotes", 3600, JSON.stringify(quotes));
    //     res.json(quotes);
    //   }
    // });
    res.send('gut')
  } catch (error) {
    console.log(error)
    return res.status(500).json(error)
  }
})

app.listen('3000', () => console.log('object'))

// ;(async () => {
//   try {
//     console.log(process.env.USERNAME_DB)
//     const client = redis.createClient({
//       url: `redis://${process.env.USERNAME_DB}:${process.env.PASSWORD}@${process.env.HOST}:${process.env.PORT}`,
//     })

//     client.on('error', (err) => console.log('Redis Client Error', err))

//     await client.connect()

//     client.on('connect', function () {
//       console.log('Connected!')
//     })

//     await client.set('test', 'value')
//     const value = await client.get('key')
//   } catch (err) {
//     console.log(err)
//   }
// })()

// async function run() {
//   console.log('e')

//   const client = redis.createClient({
//     port: process.env.PORT,
//     host: process.env.HOST,
//   })
//   console.log(client)
//   client.on('connect', function () {
//     console.log('Connected!')
//   })

//   clg
// }
// run()
