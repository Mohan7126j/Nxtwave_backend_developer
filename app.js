const express = require('express')
const {addDays, format} = require('date-fns')

const app = express()

let dateTime = new Date()
let result = format(addDays(dateTime, 100), 'dd/MM/yyyy')
app.get('/', (request, response) => {
  response.send(result)
})

app.listen(3000, () => {
  console.log('Running')
})

module.exports = app
