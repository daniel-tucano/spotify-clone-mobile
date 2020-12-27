import mongoose, { Document } from 'mongoose'

export interface PlaylistType extends Document {
    name: string
    creator: {
        uid: string
        name: string
        username: string
    }
    songs: string[]
    postedDate: Date
}

const PlaylistMongoSchema = new mongoose.Schema({
    name: {
        type: String,
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
    songs: {
        type: [String],
        required: true,
    },
    postedDate: {
        type: Date,
        required: true,
    },
})

export default mongoose.model<PlaylistType>('Playlist', PlaylistMongoSchema)
