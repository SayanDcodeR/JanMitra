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
const multer = require('multer');
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));





app.post('/upload', (req, res) => {
  // req.files contains array of uploaded files
  console.log(req.files);

  // Save file paths in MongoDB (just store their path or URL)
  const photoPaths = req.files.map(file => file.path);

  // Example response
  res.json({ message: 'Files uploaded successfully!', photos: photoPaths });
});
app.get("/home",(req,res)=>{
    // res.render("layouts/boilerplate.ejs");
    res.render("home.ejs"); 
});
app.get("/report",(req,res)=>{
  res.render("report.ejs");
});
app.get("/about",(req,res)=>{
  res.render("about.ejs");
});
app.get("/profile", (req, res) => {
  res.render("profile-final"); // profile-final.ejs
});

app.get("/issues",(req,res)=>{
  res.render("issues.ejs");
})
// app.get("/issues",(req,res)=>{
//   res.
// })
// app.post("/report",(req,res)=>{
//     console.log(req.body.issue);
// })
app.listen("8000",()=>{
    console.log("Server connected");
});