import mongoose, { Document } from 'mongoose'

export interface SongType extends Document {
    title: string
    album?: string
    artist: string
    genre?: string
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
    contentType: string
}

const SongMongoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    album: {
        type: String,
        required: false,
    },
    artist: {
        type: String,
        required: true,
    },
    genre: {
        type: String,
        required: false,
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
    contentType: {
        type: String,
        required: true,
    },
})

export default mongoose.model<SongType>('Song', SongMongoSchema)
