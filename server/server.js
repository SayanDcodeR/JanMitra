require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const ExpressError = require("./utils/ExpressError");

// Import Routes
const authRoutes = require("./routes/auth.routes");
const issuesRoutes = require("./routes/issues.routes");
const commentsRoutes = require("./routes/comments.routes");
const mapsRoutes = require("./routes/maps.routes");
const usersRoutes = require("./routes/users.routes");

const app = express();
const PORT = process.env.PORT || 8000;
const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/janmitra";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
async function startServer() {
    try {
        await mongoose.connect(dbUrl);
        console.log("MongoDB Connected");

        // Routes
        app.use("/api/auth", authRoutes);
        app.use("/api/issues", issuesRoutes);
        app.use("/api/issues/:issueId/comments", commentsRoutes);
        app.use("/api/maps", mapsRoutes);
        app.use("/api/users", usersRoutes);

        // 404 Handler (Express 5 syntax)
        app.all("/{*splat}", (req, res, next) => {
            next(new ExpressError(404, "Page Not Found!"));
        });

        // Error Handling Middleware
        app.use((err, req, res, next) => {
            console.error("Global Error Handler Caught:", err);
            const { statusCode = 500, message = "Something went wrong!" } = err;
            res.status(statusCode).json({
                success: false,
                message: err.message || message,
                error: message
            });
        });

        app.listen(PORT, () => {
            console.log(`Server connected on port ${PORT}`);
        });

    } catch (err) {
        console.error("\n DB connection failure reason:");
        console.error("Message:", err.message);
        if (err.code) console.error("Code:", err.code);
        if (err.syscall) console.error("Syscall:", err.syscall);
        if (err.hostname) console.error("Hostname:", err.hostname);
        console.error("\nPlease check your internet connection, DNS settings, and MongoDB Atlas IP Whitelist.\n");
        process.exit(1);
    }
}

startServer();
