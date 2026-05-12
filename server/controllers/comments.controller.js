const Comment = require("../models/comment");
const Issue = require("../models/issues");
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

module.exports.getCommentsForIssue = catchAsync(async (req, res, next) => {
    const { issueId } = req.params;
    const comments = await Comment.find({ issue: issueId }).populate("user", "username email").sort({ createdAt: -1 });
    res.json({ success: true, comments });
});

module.exports.createComment = catchAsync(async (req, res, next) => {
    const { issueId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
        throw new ExpressError(400, "Comment cannot be empty!");
    }

    const issue = await Issue.findById(issueId);
    if (!issue) {
        throw new ExpressError(404, "Issue not found!");
    }

    const newComment = new Comment({
        content: content.trim(),
        user: req.user.id,
        issue: issueId
    });

    await newComment.save();
    
    // Populate user before sending back
    await newComment.populate("user", "username email");

    res.status(201).json({ success: true, message: "Comment added successfully", comment: newComment });
});

module.exports.deleteComment = catchAsync(async (req, res, next) => {
    const { issueId, commentId } = req.params;
    
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ExpressError(404, "Comment not found!");
    }

    // Check if user is the author or an admin
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
        throw new ExpressError(403, "You don't have permission to delete this comment!");
    }

    await Comment.findByIdAndDelete(commentId);
    res.json({ success: true, message: "Comment deleted successfully!" });
});
