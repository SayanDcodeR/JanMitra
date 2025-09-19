const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const issueSchema=new Schema({
    title:{
        type:String,
        required:true
    },
    description:String,
    category:String,
    zone:String,
    priority:String, 
    image: {
        url: String,
        filename: String,
    },
    location:{
        lat:Number,
        long:Number
    },
    address:String,
    createdAt:{
        type:Date,
        default:Date.now()
    },
    user:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    status:{
        type:String,
        enum:['pending','resolved'],
        default:'pending'
    }

});
const Issue=mongoose.model("Issue",issueSchema);
module.exports=Issue;
