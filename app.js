const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')
let db = null

const initializeDBandServer = async () => {
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  })
  app.listen(3000, () => {
    console.log('Server Running at http://localhost:3000')
  })
  console.log('Database CONNECTED')
}

//API:1 get list of Movie_name from movie table
app.get('/movies/', async (request, response) => {
  const movieNamesQuery = `SELECT movie_name FROM movie;`
  const movieNames = await db.all(movieNamesQuery)
  response.send(movieNames)
})

//API:2 Creates a new movie in the movie table
app.post('/movies/', async (request, response) => {
  const newMovie = request.body
  const {directorId, movieName, leadActor} = newMovie
  const insertMovieQuery = `INSERT INTO movie (director_id, movie_name, lead_actor) VALUES(
    ${directorId}, '${movieName}', '${leadActor}'
  );`
  await db.run(insertMovieQuery)
  response.send('Movie Successfully Added')
})

//API:3 Returns a movie based on the movie ID
app.get('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const getMovieDetailQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`
  const movieDetails = await db.get(getMovieDetailQuery)
  response.send(movieDetails)
})

//API:4 Updates the details of a movie in the movie table based on the movie ID
app.put('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const updateMovieQuery = `UPDATE movie
   SET director_id = ${directorId}, movie_name = '${movieName}', lead_actor = '${leadActor}'
   WHERE movie_id = ${movieId}`
  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

//API:5 Deletes a movie from the movie table based on the movie ID
app.delete('/movies/:movieId', async (request, response) => {
  try {
    const {movieId} = request.params
    const deleteMovieQuery = `DELETE FROM movie 
  WHERE movie_id = ${movieId};`

    await db.run(deleteMovieQuery)
    response.send('Movie Removed')
  } catch (error) {
    console.log(error.message)
  }
})

//API:6 Returns a list of all directors in the director table
app.get('/directors/', async (request, response) => {
  const getDirectorQuery = 'SELECT * FROM director'
  const directorsList = await db.all(getDirectorQuery)
  response.send(directorsList)
})

//API:7 Returns a list of all movie names directed by a specific director
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const movieNameQuery = `SELECT movie.movie_name FROM movie NATURAL JOIN director
  WHERE director_id = ${directorId} ;`
  const movieNameByDirectorId = await db.all(movieNameQuery)
  response.send(movieNameByDirectorId)
})
initializeDBandServer()

module.exports = app
