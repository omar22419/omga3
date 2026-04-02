import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },
    description:{
        type:String,
        trim:true,
    },
    color:{
        type:String,
        default:"#FF5730"
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true

    },
    members:[{
        user:{
            type:Schema.Types.ObjectId,
            ref:"User",
        },
        role:{
            type:String,
            enum:["owner", "member",'admin', "viewer"],
            default:"member"
        },
        joinedAt:{
            type:Date, 
            default:Date.now
        }
    }],
    projects:[{
        type:Schema.Types.ObjectId,
        ref:"Project",
    }]
},{
    timestamps:true
})

export const Workspace  = mongoose.models.Workspace || mongoose.model('Workspace',workspaceSchema);