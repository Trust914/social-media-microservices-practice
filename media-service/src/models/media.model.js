import mongoose  from "mongoose";

const {Schema, model} = mongoose

const mediaSchema = new Schema({
    user : {
        type: Schema.Types.ObjectId,
        required: true
    },
    post: {
        type: Schema.Types.ObjectId,
        // required: true
    },
    url: {
        type:String,
        required:true,
        trim: true
    },
    publicId :{
        type:String,
        required:true,
        trim: true
    },
    originalName: {
        type:String,
        required:true,
        trim: true
    },
    mimeType :{
        type:String,
        required:true,
        trim: true
    }
},{timestamps:true})

mediaSchema.index({ publicId: 1 }); 

const MediaModel = model("Media",mediaSchema)
export default MediaModel
