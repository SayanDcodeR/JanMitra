const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    content: {
        type: String,
        required: true,
        trim: true,
        maxLength: 500
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    issue: {
        type: Schema.Types.ObjectId,
        ref: "Issue",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
commentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});