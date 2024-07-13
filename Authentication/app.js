const express = require('express')
const app = express()
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const bcrypt = require('bcrypt')

app.use(express.json())

let db
const dbPath = path.join(__dirname, 'userData.db')
const initialDbAndServer = async () => {
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  })
  app.listen(3000, () => console.log('Running at http://localhost:3000'))
}

//API-1 Register a new user
app.post('/register/', async (request, response) => {
  const {username, name, password, gender, location} = request.body
  //Check user already exits
  const getUser = `SELECT * FROM user WHERE username = '${username}';`
  const user = await db.get(getUser)
  if (user === undefined) {
    if (password.length < 5) {
      response.status(400)
      response.send('Password is too short')
    } else {
      const hashedPassword = await bcrypt.hash(password, 10)
      const insertUser = `INSERT INTO user VALUES ('${username}', '${name}', '${hashedPassword}', '${gender}', '${location}')`
      await db.run(insertUser)
      response.send('User created successfully')
    }
  } else {
    response.status(400)
    response.send('User already exists')
  }
})

//API-2 LOGIN
app.post('/login/', async (request, response) => {
  const {username, password} = request.body
  const user = `SELECT * FROM user WHERE username = '${username}';`
  const getUser = await db.get(user)
  if (getUser === undefined) {
    response.status(400)
    response.send('Invalid user')
  } else {
    const isPasswordTrue = await bcrypt.compare(password, getUser.password)
    if (isPasswordTrue) {
      response.send('Login success!')
    } else {
      response.status(400)
      response.send('Invalid password')
    }
  }
})

//API-3 change-password

app.put('/change-password/', async (request, response) => {
  const {username, oldPassword, newPassword} = request.body
  const getUserQuery = `SELECT * FROM user WHERE username = '${username}'`
  const user = await db.get(getUserQuery)

  if (user !== undefined) {
    const isPasswordTrue = await bcrypt.compare(oldPassword, user.password)
    console.log(isPasswordTrue)
    if (isPasswordTrue) {
      if (newPassword.length < 5) {
        response.status(400)
        response.send('Password is too short')
      } else {
        const hashedNewPassword = await bcrypt.hash(newPassword, 10)
        console.log(hashedNewPassword)
        const updatePasswordQuery = `UPDATE user SET password = '${hashedNewPassword}'
                                      WHERE username = '${username}'`
        await db.run(updatePasswordQuery)
        response.send('Password updated')
      }
    } else {
      response.status(400)
      response.send('Invalid current password')
    }
  }
})
initialDbAndServer()

module.exports = app
