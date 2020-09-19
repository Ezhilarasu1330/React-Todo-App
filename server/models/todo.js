const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const todoSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxlength: 50
    },
    body: {
        type: String,
        required: true,
        maxlength: 100000
    },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true
    }
}, { timestamps: true });

const Todo = mongoose.model('Todo', todoSchema);

module.exports = { Todo }