import Playlist, { PlaylistType } from '../models/Playlists'
import lodash from 'lodash'
import { Request, Response } from 'express'
import { paginate } from '../functions/paginate'

module.exports = {
    async index(req: Request, res: Response) {
        let { page = 1, limit = 10 } = req.query
        const estimatedDocumentCount =
            req.query.estimatedDocumentCount !== 'false'
        page = Number(page)
        limit = Number(limit)

        // Checks if page and limit query parameters are valid
        if (!(Number.isInteger(page) && Number.isInteger(limit)))
            return res
                .status(400)
                .send('PAGE AND LIMIT PARAMETERS MUST BE NUMBERS')

        const playlists = await paginate(
            Playlist,
            req.ODataFilter,
            req.ODataSort,
            {
                page,
                limit,
                estimatedDocumentCount,
            }
        )

        return res.json(playlists)
    },

    async show(req: Request, res: Response) {
        const playlist = await Playlist.findById(req.params.id)

        if (!playlist) return res.status(404).send('SONG NOT FOUND')

        return res.json(playlist)
    },

    async store(req: Request<any, any, PlaylistType>, res: Response) {
        // Checks if the operation is authorized
        if (req.decodedIdToken?.uid !== req.body.creator.uid)
            return res
                .status(401)
                .send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION')
        // Adds current server date to postedDate field
        req.body.postedDate = new Date()
        // Add playlist to database
        const playlist = await Playlist.create(req.body)
        // Return value added
        return res.json(playlist)
    },

    async update(req: Request<any, any, PlaylistType>, res: Response) {
        // Reading the resource current value
        let playlist = await Playlist.findById(req.params.id, null, {
            lean: true,
        })

        // Checks if the playlist exists
        if (!playlist) return res.status(404).send('SONG NOT FOUND')

        // Checks if the operation is authorized
        if (req.decodedIdToken?.uid !== playlist.creator.uid)
            return res
                .status(401)
                .send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION')

        // Checks if it's trying to change creator field
        if (!lodash.isEqual(req.body.creator, playlist.creator))
            return res
                .status(401)
                .send(
                    'CLIENT NOT AUTHORIZED TO PERFORM OPERATION! NOT ALLOWED TO CHANGE DOCUMENT CREATOR'
                )

        // If it is authorized, perform the operation and return its result
        playlist = await Playlist.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            useFindAndModify: false,
            lean: true,
        })
        return res.json(playlist)
    },

    async destroy(req: Request, res: Response) {
        // Reading the resource current value
        let playlist = await Playlist.findById(req.params.id, null, {
            lean: true,
        })

        // Checks if the playlist exists
        if (!playlist) return res.status(404).send('AIRFOIL NOT FOUND')

        // Checks if the operation is authorized
        if (req.decodedIdToken?.uid !== playlist.creator.uid)
            return res
                .status(401)
                .send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION')

        // If it is authorized, perform the operation and return its result
        await Playlist.findByIdAndDelete(req.params.id)

        return res.status(200).send()
    },
}
