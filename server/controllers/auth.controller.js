const User = require("../models/user");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

module.exports.register = catchAsync(async (req, res, next) => {
    const { username, email, mobile, role, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        return res.status(400).json({ success: false, message: "User already exists with this email or username." });
    }

    const userMobile = mobile ? mobile : undefined;

    const newUser = new User({
        username,
        email,
        mobile: userMobile,
        role
    });

    const user = await User.register(newUser, password);

    const token = jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
    );

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        token,
        user: { id: user._id, username: user.username, email: user.email, role: user.role }
    });
});

module.exports.login = catchAsync(async (req, res, next) => {
    const { username, password } = req.body;

    const authenticate = User.authenticate();
    const result = await authenticate(username, password);

    if (!result.user || result.error) {
        return res.status(400).json({ success: false, message: "Invalid username or password" });
    }
    const user = result.user;

    const token = jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
    );

    res.json({
        success: true,
        message: "Logged in successfully",
        token,
        user: { id: user._id, username: user.username, email: user.email, role: user.role }
    });
});
