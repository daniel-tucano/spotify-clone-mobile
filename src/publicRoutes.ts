import express from 'express'
const publicRoutes = express.Router()

const SongController = require('./controllers/SongController')
const PlaylistController = require('./controllers/PlaylistController')
const UserController = require('./controllers/UserController')

// Root route
publicRoutes.get('/', (_req, res) => {
    res.status(200).send('welcome to spotify clone mobile REST API!')
})

// Song Public Routes
publicRoutes.get('/songs', SongController.index)
publicRoutes.get('/songs/:id', SongController.show)

// Playlist Public Routes
publicRoutes.get('/playlists', PlaylistController.index)
publicRoutes.get('/playlists/:id', PlaylistController.show)

// Users Public Routes
publicRoutes.get('/users', UserController.index)
publicRoutes.get('/users/:id', UserController.show)

export default publicRoutes
