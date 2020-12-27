import Song, { SongType } from '../models/Songs'
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

        const songs = await paginate(Song, req.ODataFilter, req.ODataSort, {
            page,
            limit,
            estimatedDocumentCount,
        })

        return res.json(songs)
    },

    async show(req: Request, res: Response) {
        const song = await Song.findById(req.params.id)

        if (!song) return res.status(404).send('SONG NOT FOUND')

        return res.json(song)
    },

    async store(req: Request<any, any, SongType>, res: Response) {
        // Checks if the operation is authorized
        if (req.decodedIdToken?.uid !== req.body.creator.uid)
            return res
                .status(401)
                .send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION')
        // Adds current server date to postedDate field
        req.body.postedDate = new Date()
        if (req.body.releaseDate) {
            req.body.releaseDate = new Date(req.body.releaseDate)
        }
        // Add song to database
        const song = await Song.create(req.body)
        // Return value added
        return res.json(song)
    },

    async update(req: Request<any, any, SongType>, res: Response) {
        // Reading the resource current value
        let song = await Song.findById(req.params.id, null, { lean: true })

        // Checks if the song exists
        if (!song) return res.status(404).send('SONG NOT FOUND')

        // Checks if the operation is authorized
        if (req.decodedIdToken?.uid !== song.creator.uid)
            return res
                .status(401)
                .send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION')

        // Checks if it's trying to change creator field
        if (!lodash.isEqual(req.body.creator, song.creator))
            return res
                .status(401)
                .send(
                    'CLIENT NOT AUTHORIZED TO PERFORM OPERATION! NOT ALLOWED TO CHANGE DOCUMENT CREATOR'
                )

        // If it is authorized, perform the operation and return its result
        song = await Song.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            useFindAndModify: false,
            lean: true,
        })
        return res.json(song)
    },

    async destroy(req: Request, res: Response) {
        const { objID }: { objID?: boolean } = req.params

        // Reading the resource current value
        let song
        if (objID) {
            song = await Song.findOne({ objID: req.params.id }, null, {
                lean: true,
            })
        } else {
            song = await Song.findById(req.params.id, null, { lean: true })
        }

        // Checks if the song exists
        if (!song) return res.status(404).send('SONG NOT FOUND')

        // Checks if the operation is authorized
        if (req.decodedIdToken?.uid !== song.creator.uid)
            return res
                .status(401)
                .send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION')

        // If it is authorized, perform the operation and return its result
        await Song.findByIdAndDelete((song as SongType).id)

        return res.status(200).send()
    },
}
