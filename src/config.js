const mongoose = require("mongoose");
const connect = mongoose.connect("mongodb+srv://naphatedit142521:SJeq9eYTSg6KHd45@note-web.lizac.mongodb.net/login-tut?retryWrites=true&w=majority&appName=Note-web");

connect.then(() => {
    console.log('connect Database successfully...')
})
.catch((err) => {
    console.log(err)
})

// Create user schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

// Create note schema
const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    // Reference the user who created the note (optional)
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    }
});

// Create the model for user and note
const User = new mongoose.model("users", userSchema);
const Note = mongoose.model('Note', noteSchema);

// Exprot models
module.exports = {
    User,
    Note
};