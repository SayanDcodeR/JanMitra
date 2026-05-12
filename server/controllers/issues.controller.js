const Issue = require("../models/issues");
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

module.exports.getAllIssues = catchAsync(async (req, res, next) => {
    const issues = await Issue.find({}).populate("user", "username email").sort({ createdAt: -1 });
    res.json({ success: true, issues });
});

module.exports.getIssueById = catchAsync(async (req, res, next) => {
    if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ExpressError(400, "Invalid issue ID format");
    }
    const issue = await Issue.findById(req.params.id).populate("user", "username email");
    if (!issue) {
        throw new ExpressError(404, "Issue not found");
    }
    res.json({ success: true, issue });
});

module.exports.createIssue = catchAsync(async (req, res, next) => {
    // Expects issue data either directly in body or in a nested object.
    const issueData = req.body.issue || req.body;
    
    // Strict Location Validation
    if (!issueData.location || !issueData.location.lat || !issueData.location.long) {
        throw new ExpressError(400, "Valid location coordinates (latitude and longitude) are strictly required.");
    }

    const newIssue = new Issue(issueData);
    
    if (req.file) {
        newIssue.image = { url: req.file.path, filename: req.file.filename };
    }
    newIssue.user = req.user.id; // From auth middleware
    await newIssue.save();
    
    res.status(201).json({ success: true, message: "Issue reported successfully", issue: newIssue });
});

module.exports.getStats = catchAsync(async (req, res, next) => {
    const totalIssues = await Issue.countDocuments();
    const pendingIssues = await Issue.countDocuments({ status: "pending" });
    const resolvedIssues = await Issue.countDocuments({ status: "resolved" });
    
    res.json({ success: true, stats: { totalIssues, pendingIssues, resolvedIssues } });
});

module.exports.updateIssueStatus = catchAsync(async (req, res, next) => {
    const { status } = req.body;
    const issue = await Issue.findByIdAndUpdate(req.params.id, { status }, { new: true });
    
    if (!issue) {
        throw new ExpressError(404, "Issue not found");
    }
    res.json({ success: true, message: "Issue status updated", issue });
});

module.exports.updateIssueDetails = catchAsync(async (req, res, next) => {
    const { title, description, category, priority, status, address } = req.body;
    
    const issue = await Issue.findByIdAndUpdate(
        req.params.id, 
        { title, description, category, priority, status, address }, 
        { new: true, runValidators: true }
    );
    
    if (!issue) {
        throw new ExpressError(404, "Issue not found");
    }
    res.json({ success: true, message: "Issue updated successfully", issue });
});
