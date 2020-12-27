import express from 'express'
import multerImg from './functions/multerImg'
const privateRoutes = express.Router()

const SongController = require('./controllers/SongController')
const PlaylistController = require('./controllers/PlaylistController')
const UserController = require('./controllers/UserController')

// Airfoil Private Routes
privateRoutes.post('/songs', SongController.store)
privateRoutes.put('/songs/:id', SongController.update)
privateRoutes.delete('/songs/:id', SongController.destroy)

// Runs Private Routes
privateRoutes.post('/playlists', PlaylistController.store)
privateRoutes.put('/playlists/:id', PlaylistController.update)
privateRoutes.delete('/playlists/:id', PlaylistController.destroy)

// Users Private Routes
privateRoutes.post('/users', UserController.store)
privateRoutes.put('/users/:id', UserController.update)
privateRoutes.delete('/users/:id', UserController.destroy)
privateRoutes.post(
    '/users/upload/profile-image/:id',
    multerImg('profile-image'),
    UserController.uploadProfilePic
)

export default privateRoutes
