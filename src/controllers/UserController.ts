import User from '../models/Users'
import admin from 'firebase-admin'
import fs from 'fs'
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

        const users = await paginate(User, req.ODataFilter, req.ODataSort, {
            page,
            limit,
            estimatedDocumentCount,
        })

        return res.json(users)
    },

    async show(req: Request, res: Response) {
        const uid = req.params.uid !== 'false'

        const user = uid
            ? await User.findOne({ uid: req.params.id })
            : await User.findById(req.params.id)

        return res.json(user)
    },

    async store(req: Request, res: Response) {
        const user = await User.create({ ...req.body, joinDate: new Date() })

        return res.json(user)
    },

    async update(req: Request, res: Response) {
        const uid = req.params.uid !== 'false'

        if (req.params.id !== req.decodedIdToken?.uid)
            return res
                .status(401)
                .send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION')

        const user = uid
            ? await User.findOneAndUpdate({ uid: req.params.id }, req.body, {
                  new: true,
                  useFindAndModify: false,
              })
            : await User.findByIdAndUpdate(req.params.id, req.body, {
                  new: true,
                  useFindAndModify: false,
              })

        if (!user) return res.status(404).send("USER DON'T EXISTS")

        return res.json(user)
    },

    async destroy(req: Request, res: Response) {
        const uid = req.params.uid !== 'false'

        if (req.params.id !== req.decodedIdToken?.uid)
            return res
                .status(401)
                .send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION')

        const user = uid
            ? await User.findOneAndRemove({ uid: req.params.id })
            : await User.findByIdAndRemove(req.params.id)

        if (!user) return res.status(404).send("USER DON'T EXISTS")

        return res.send()
    },

    async uploadProfilePic(req: Request, res: Response) {
        const uid = req.query.uid !== 'false'
        const original = req.query.original !== 'false'

        if (req.params.id !== req.decodedIdToken?.uid)
            return res
                .status(401)
                .send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION')

        // Obtain current user data
        const currentUserData = uid
            ? await User.findOne({ uid: req.params.id as string })
            : await User.findById(req.params.id)

        if (!currentUserData) return res.status(404).send("USER DON'T EXISTS")

        const uploadedFilePath = `${req.params.id}/${req.file.filename}`

        // Delete file if it exists and the path propertie exists
        if (original) {
            currentUserData.originalProfilePicPath &&
                admin
                    .storage()
                    .bucket()
                    .file(currentUserData.originalProfilePicPath)
                    .delete()
                    .then(() => {
                        console.log(
                            `${currentUserData.originalProfilePicPath} deleted`
                        )
                    })
                    .catch(() => {
                        console.log(
                            `${currentUserData.originalProfilePicPath} was not deleted`
                        )
                    })
        } else {
            currentUserData.profilePic &&
                currentUserData.profilePic.path &&
                admin
                    .storage()
                    .bucket()
                    .file(currentUserData.profilePic.path)
                    .delete()
                    .then(() => {
                        console.log(
                            `${currentUserData.profilePic?.path} deleted`
                        )
                    })
                    .catch(() => {
                        console.log(
                            `${currentUserData.profilePic?.path} was not deleted`
                        )
                    })
        }

        // Upload file to the cloud
        const uploadResponse = await admin
            .storage()
            .bucket()
            .upload(req.file.path, {
                destination: uploadedFilePath,
            })

        console.log(`${req.file.filename} uploaded to cloud.`)

        // Delete file from local storage
        fs.unlink(req.file.path, (err) => {
            err
                ? console.log(err)
                : console.log(`${req.file.filename} deleted from local storage`)
        })

        await uploadResponse[0].makePublic()

        const url = `https://storage.googleapis.com/spotify-clone-mobile.appspot.com/${req.params.id}%2F${req.file.filename}`

        // Data to be updated on user to reflect the new image upload
        const updateData = {
            ...(original
                ? { originalProfilePicPath: uploadedFilePath }
                : { profilePic: { url, path: uploadedFilePath } }),
        }

        uid
            ? await User.findOneAndUpdate({ uid: req.params.id }, updateData, {
                  new: true,
                  useFindAndModify: false,
              })
            : await User.findByIdAndUpdate(req.params.id, updateData, {
                  new: true,
                  useFindAndModify: false,
              })

        return res.status(200).send(url)
    },
}
