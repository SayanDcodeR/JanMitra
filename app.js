if(process.env.NODE_ENV!="production"){
  require("dotenv").config();
}
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
const Issue=require("./models/issues");
const multer = require('multer')
const { storage } = require("./cloudConfig.js");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const upload = multer({ storage })
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
const sessionOptions={
  secret:"mysupersecretcode",
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),// 7 days 24 hours 60mins 60secs 1000ms
    maxAge:7*24*60*60*1000,
    httpOnly:true
  }
}
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
// passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
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
app.post("/report",upload.single('issue[image]'),async(req,res)=>{
  const url = req.file.path;
    const filename = req.file.filename;
    console.log(url,filename);
  const newIssue= new Issue(req.body.issue);
  newIssue.image={url,filename};
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