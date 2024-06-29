const express = require('express')
const app = express()
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

app.use(express.json())
const dbFilePath = path.join(__dirname, 'cricketTeam.db')

let db = null

//Database conection
const initialDBAndServer = async () => {
  try {
    db = await open({
      filename: dbFilePath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Running')
    })
  } catch (error) {
    console.log('DB ERROR : ' + error.message)
    process.exit(1)
  }
}

initialDBAndServer()

// API-1 : Returns a list of all players in the team
app.get('/players/', async (request, response) => {
  const playersQuery = 'SELECT * FROM cricket_team;'
  const playersDetails = await db.all(playersQuery)
  response.send(playersDetails)
})

// API-2 Creates a new player in the team
app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const addPlayerQuery = `INSERT INTO cricket_team (player_Name, jersey_Number, role) 
  VALUES ('${playerName}', '${jerseyNumber}', '${role}');`

  await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})

//API-3 Returns a player based on a player ID
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerQuery = `SELECT * FROM cricket_Team WHERE player_id = ${playerId}`
  const player = await db.get(playerQuery)
  response.send(player)
})

//API-4 Updates the details of a player in the team
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName, jerseyNumber, role} = request.body
  const updatePlayerQuery = `UPDATE cricket_team 
  SET 
  player_name = '${playerName}',
  jersey_number = ${jerseyNumber},
  role = '${role}'
  WHERE player_id = ${playerId};`
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

//API-5 Deletes a player from the team
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `DELETE FROM cricket_team 
        WHERE player_id = ${playerId}`
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
