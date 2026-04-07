if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const Comment = require("./models/comment");

const express = require("express");
const app = express();
const mongoose = require("mongoose");
// const MONGO_URL = "mongodb://127.0.0.1:27017/communityOne";
const dbUrl=process.env.ATLASDB_URL;
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
// const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const Issue = require("./models/issues");
const multer = require('multer')
const { storage } = require("./cloudConfig.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const { isLoggedIn, saveRedirectUrl, isAdmin } = require("./middleware.js");
const upload = multer({ storage })
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json());

const sessionOptions = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),// 7 days 24 hours 60mins 60secs 1000ms
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true
  }
}
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
async function main() {
  await mongoose.connect(dbUrl);
}
main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log("Error in connecting DB");
  });
app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  next();
});

app.get("/home", async(req, res) => {
  // res.render("layouts/boilerplate.ejs");
  const totalIssues= await Issue.countDocuments();
  const pendingIssues=await Issue.countDocuments({status:"pending"});
  const resolvedIssues=await Issue.countDocuments({status:"resolved"});
  const activeCitizens=await User.countDocuments({role:"citizen"});
  res.render("home.ejs",{totalIssues,pendingIssues,resolvedIssues,activeCitizens});
});
app.get("/report",saveRedirectUrl, isLoggedIn, (req, res) => {
  res.render("report.ejs");
});
app.get("/about", (req, res) => {
  res.render("about.ejs");
});
app.post("/issues/:id/comments", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      req.flash("error", "Comment cannot be empty!");
      return res.redirect(`/issues/${id}`);
    }

    // Check if issue exists
    const issue = await Issue.findById(id);
    if (!issue) {
      req.flash("error", "Issue not found!");
      return res.redirect("/issues");
    }

    // Create new comment
    const newComment = new Comment({
      content: content.trim(),
      user: req.user._id,
      issue: id
    });

    await newComment.save();
    req.flash("success", "Comment added successfully!");
    res.redirect(`/issues/${id}`);

  } catch (error) {
    console.error("Error adding comment:", error);
    req.flash("error", "Failed to add comment!");
    res.redirect(`/issues/${req.params.id}`);
  }
});

// Delete a comment (only by comment author or admin)
app.delete("/issues/:issueId/comments/:commentId", isLoggedIn, async (req, res) => {
  try {
    const { issueId, commentId } = req.params;
    
    const comment = await Comment.findById(commentId);
    if (!comment) {
      req.flash("error", "Comment not found!");
      return res.redirect(`/issues/${issueId}`);
    }

    // Check if user is the author of the comment or an admin
    if (!comment.user.equals(req.user._id) && req.user.role !== 'admin') {
      req.flash("error", "You don't have permission to delete this comment!");
      return res.redirect(`/issues/${issueId}`);
    }

    await Comment.findByIdAndDelete(commentId);
    req.flash("success", "Comment deleted successfully!");
    res.redirect(`/issues/${issueId}`);

  } catch (error) {
    console.error("Error deleting comment:", error);
    req.flash("error", "Failed to delete comment!");
    res.redirect(`/issues/${req.params.issueId}`);
  }
});

// Get comments count for an issue (API endpoint)
app.get("/api/issues/:id/comments-count", async (req, res) => {
  try {
    const { id } = req.params;
    const count = await Comment.countDocuments({ issue: id });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to get comments count" });
  }
});
app.get("/issues", async (req, res) => {
  const allIssues = await Issue.find({}).populate("user");
  res.render("issues.ejs", { 
    allIssues,
    mapboxToken: process.env.MAP_TOKEN
  });
});
app.post("/report",saveRedirectUrl,isLoggedIn, upload.single('issue[image]'), async (req, res) => {
  // console.log(req.body.issue);
  const url = req.file.path;
  const filename = req.file.filename;
  const newIssue = new Issue(req.body.issue);
  newIssue.image = { url, filename };
  newIssue.user=req.user._id;
  await newIssue.save();
  const allIssues = await Issue.find({});
  res.redirect("/issues");
})

app.get("/signup", (req, res) => {
  // Render signup form
  res.render("signup.ejs");
});
app.post("/signup", async (req, res) => {
  // console.log(req.body);
  // return res.send("ok");
  try {
    // console.log(req.body);
    const { username, email, mobile,role,password} = req.body;
   
    const newUser = new User({ email, username, mobile, role });
    // console.log(newUser);
    const registeredUser = await User.register(newUser, password);
    // console.log(registeredUser);
    req.login(registeredUser, (err) => {
        if (err) {
            return next(err);
        }
        if(newUser.role==='admin'){

          return res.redirect("/admin");
        }
        // req.flash("success", "Welcome to WanderLust");
        res.redirect("/home");
    });
  } catch (e) {
    // req.flash("error", e.message);
    res.send(e.message);
  }

});
app.get("/login", (req, res) => {
  res.render("login.ejs");
});
app.post("/login", saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }),(req, res) => {
  if(req.user.role=="admin"){
    return res.redirect("/admin");
  }
  const redirectUrl = res.locals.redirectUrl || "/home";
  res.redirect(redirectUrl);
});
app.get("/logout",(req,res)=>{
  req.logout((err) => {
        if (err) {
            return next(err);
        }
        // req.flash("success", "You are logged out!");
        res.redirect("/home");
    })
});
app.get("/profile",(req,res)=>{
  res.render("profile.ejs");
});
app.get("/admin",(req,res)=>{
  res.render("admindash.ejs");
})
app.get("/search-issues", async (req, res) => {
  try {
    const { location } = req.query;
    
    if (!location) {
      return res.json({ success: false, message: "Location parameter is required" });
    }

    // Create a case-insensitive regex search for location
    const locationRegex = new RegExp(location, 'i');
    
    // Search in both address and zone fields
    const issues = await Issue.find({
      $or: [
        { address: { $regex: locationRegex } },
        { zone: { $regex: locationRegex } }
      ]
    }).populate("user", "username").sort({ createdAt: -1 });

    res.json({
      success: true,
      issues: issues,
      count: issues.length,
      searchTerm: location
    });

  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error searching issues" 
    });
  }
});
app.get("/issues-map-data", async (req, res) => {
  try {
    const issues = await Issue.find({})
      .populate("user", "username")
      .select('title description category priority status location address createdAt _id image');
    
    // Filter out issues without location data
    const issuesWithLocation = issues.filter(issue => 
      issue.location && 
      issue.location.lat && 
      issue.location.long &&
      !isNaN(issue.location.lat) && 
      !isNaN(issue.location.long)
    );

    // Format data for map markers
    const mapData = issuesWithLocation.map(issue => ({
      id: issue._id,
      title: issue.title,
      description: issue.description,
      category: issue.category,
      priority: issue.priority,
      status: issue.status,
      address: issue.address,
      coordinates: [issue.location.long, issue.location.lat], // Mapbox uses [lng, lat]
      createdAt: issue.createdAt,
      reportedBy: issue.user ? issue.user.username : 'Unknown',
      imageUrl: issue.image ? issue.image.url : null
    }));

    res.json({
      success: true,
      issues: mapData,
      total: mapData.length
    });

  } catch (error) {
    console.error("Error fetching map data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching map data"
    });
  }
});
app.get("/issues/:id", async(req, res) => {
  const { id } = req.params;
  try {
    const issue = await Issue.findById(id).populate("user");
    if (!issue) {
      req.flash("error", "Issue does not exist!");
      return res.redirect("/issues");
    }

    // Get comments for this issue
    // const comments = await Comment.find({ issue: id })
    //   .populate("user", "username")
    //   .sort({ createdAt: -1 }); // Most recent first

    res.render("issue-details.ejs", { 
      issue,
      // comments,
      mapboxToken: process.env.MAP_TOKEN
    });
  } catch (error) {
    console.error("Error fetching issue details:", error);
    req.flash("error", "Something went wrong!");
    res.redirect("/issues");
  }
});

async function forwardGeocode(address) {
    try {
        const response = await geocodingClient.forwardGeocode({
            query: address,
            limit: 5,
            language: ['en'] // Optional: specify language
        }).send();

        if (response && response.body && response.body.features.length > 0) {
            const features = response.body.features;
            return features.map(feature => ({
                formatted_address: feature.place_name,
                coordinates: {
                    lng: feature.center[0],
                    lat: feature.center[1]
                },
                place_type: feature.place_type,
                relevance: feature.relevance,
                context: feature.context || [] // Additional location info
            }));
        } else {
            throw new Error('No results found');
        }
    } catch (error) {
        console.error('Mapbox forward geocoding error:', error);
        throw error;
    }
}

// Your route remains the same
app.post('/forward-geocode', async (req, res) => {
    try {
        const { address } = req.body;
        
        if (!address || address.trim() === '') {
            return res.status(400).json({ error: 'Address is required' });
        }

        const results = await forwardGeocode(address);
        res.json({ results });
    } catch (error) {
        console.error('Geocoding failed:', error);
        res.status(500).json({ error: 'Geocoding failed' });
    }
});
app.post('/search-issues-by-location', async (req, res) => {
    try {
        const { address, radius = 5 } = req.body; // radius in kilometers
        
        if (!address || address.trim() === '') {
            return res.status(400).json({ error: 'Address is required' });
        }

        // First, get coordinates from the address
        const geocodeResults = await forwardGeocode(address);
        
        if (!geocodeResults || geocodeResults.length === 0) {
            return res.json({ issues: [], message: 'Location not found' });
        }

        // Use the most relevant result (first one)
        const primaryLocation = geocodeResults[0];
        const { lat, lng } = primaryLocation.coordinates;

        // Search for issues within the specified radius
        const issues = await Issue.find({
            'location.lat': {
                $gte: lat - (radius / 111), // Approximate: 1 degree ≈ 111 km
                $lte: lat + (radius / 111)
            },
            'location.long': {
                $gte: lng - (radius / (111 * Math.cos(lat * Math.PI / 180))),
                $lte: lng + (radius / (111 * Math.cos(lat * Math.PI / 180)))
            }
        })
        .populate('user', 'username')
        .sort({ createdAt: -1 })
        .limit(50);

        res.json({
            issues,
            searchLocation: primaryLocation,
            totalFound: issues.length,
            searchRadius: radius
        });

    } catch (error) {
        console.error('Location search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});
app.post('/search-nearby-issues', async (req, res) => {
    // try {
        const { address, radius = 5 } = req.body; // radius in kilometers
        
        if (!address || address.trim() === '') {
            return res.status(400).json({ error: 'Address is required' });
        }

        // Get coordinates from the input address using Mapbox
        const geocodeResults = await forwardGeocode(address);
        
        if (!geocodeResults || geocodeResults.length === 0) {
            return res.json({ issues: [], message: 'Location not found' });
        }

        const searchLocation = geocodeResults[0];
        const searchLat = searchLocation.coordinates.lat;
        const searchLng = searchLocation.coordinates.lng;

        // Find issues within the radius using latitude/longitude bounds
        const latRadius = radius / 111; // 1 degree ≈ 111 km
        const lngRadius = radius / (111 * Math.cos(searchLat * Math.PI / 180)); // Adjust for longitude

        const issues = await Issue.find({
            'location.lat': {
                $gte: searchLat - latRadius,
                $lte: searchLat + latRadius
            },
            'location.long': {
                $gte: searchLng - lngRadius,
                $lte: searchLng + lngRadius
            }
        })
        .populate('user', 'username')
        .sort({ createdAt: -1 });
      console.log(issues);

        // Calculate actual distances and filter more precisely
    //     const issuesWithDistance = issues
    //         .map(issue => {
    //             const distance = calculateDistance(
    //                 searchLat, searchLng,
    //                 issue.location.lat, issue.location.long
    //             );
    //             return { ...issue.toObject(), distance };
    //         })
    //         .filter(issue => issue.distance <= radius)
    //         .sort((a, b) => a.distance - b.distance);

    //     res.json({
    //         issues: issuesWithDistance,
    //         searchLocation: searchLocation,
    //         totalFound: issuesWithDistance.length,
    //         searchRadius: radius
    //     });

    // } catch (error) {
    //     console.error('Proximity search error:', error);
    //     res.status(500).json({ error: 'Search failed' });
    // }
});


app.listen("8000", () => {
  console.log("Server connected");
});