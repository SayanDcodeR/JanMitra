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
    image:String

});
const Issue=mongoose.model("Issue",issueSchema);
module.exports=Issue;
