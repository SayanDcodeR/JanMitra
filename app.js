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
const Issue=require("./models/issues");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
async function main() {
  await mongoose.connect(MONGO_URL);
}
main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log("Error in connecting DB");
  });





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
app.get("/issues",async(req,res)=>{
  const allIssues=await Issue.find({});
  res.render("issues.ejs",{allIssues})
});
app.post("/report",async(req,res)=>{
  console.log(req.body.issue);
  const newIssue= new Issue(req.body.issue);
  newIssue.image="https://cdn.shopify.com/s/files/1/0274/7288/7913/files/MicrosoftTeams-image_32.jpg?v=1705315718";
  await newIssue.save();
  const allIssues=await Issue.find({});
  res.redirect("/issues");
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