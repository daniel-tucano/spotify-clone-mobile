import mongoose, { Document } from 'mongoose'

export interface SongType extends Document {
    name: string
    album: string
    artist: string
    duration: number
    creator: {
        uid: string
        name: string
        username: string
    }
    url: string
    coverImgUrl?: string
    releaseDate: Date
    postedDate: Date
}

const SongMongoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    album: {
        type: String,
        required: true,
    },
    artist: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    creator: {
        uid: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
        },
    },
    url: {
        type: String,
        required: true,
    },
    coverImgUrl: {
        type: String,
        required: false,
    },
    releaseDate: {
        type: Date,
        required: true,
    },
    postedDate: {
        type: Date,
        required: true,
    },
})

export default mongoose.model<SongType>('Song', SongMongoSchema)
