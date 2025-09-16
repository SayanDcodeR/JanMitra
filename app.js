const express=require("express");
const app=express();
const mongoose=require("mongoose");
const MONGO_URL = "mongodb://127.0.0.1:27017/communityOne";
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
// const ExpressError = require("./utils/ExpressError.js");
const session=require("express-session");
const flash=require("connect-flash");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/home",(req,res)=>{
    res.render("home.ejs");
});
app.post("/report",(req,res)=>{
    console.log(req.body.issue);
})
app.listen("8000",()=>{
    console.log("Server connected");
});