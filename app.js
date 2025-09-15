const express=require("express");
const app=express();
const mongoose=require("mongoose");
const MONGO_URL = "mongodb://127.0.0.1:27017/communityOne";
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session=require("express-session");
const flash=require("connect-flash");
app.get("/",(req,res)=>{
    res.send("Hello");
});
app.listen("8000",()=>{
    console.log("Server connected");
});