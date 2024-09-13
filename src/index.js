const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const { User, Note } = require("./config");
const { title } = require('process');
const moment = require('moment');

const app = express();

// Session middleware setup
app.use(session({
    secret: 'jojo-adventures',
    resave: false,
    saveUninitialized: false
}));

// Add middleware to make user session availble in views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Convert data to JSON format
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set static folder path
app.use(express.static("public"));

// Define Route
app.get("/", (req, res) => {
    res.render("login", { error: null, success: null });
});

app.get("/login", (req, res) => {
    res.render("login", { error: null, success: null });
});

app.get("/signup", (req, res) => {
    res.render("signup", { error: null, success: null });
});

app.get("/home", async (req, res) => {
    if(!req.session.user) {
        return res.redirect("/login");
    }

    try {
        const notes = await Note.find({ userId: req.session.user._id });

        notes.forEach(note => {
            note.formattedDate = moment(note.date).format('MMMM Do YYYY');
        });

        res.render("home", {
            username: req.session.user.username,
            notes: notes
        });
    } catch (error) {
        console.error(error);
        res.redirect("/login");
    }
});

app.get("/note", (req, res) => {
    if(!req.session.user) {
        return res.redirect("/login");
    }
    res.render("note", { error: null });
});

// Register users
app.post("/signup", async (req, res) => {
    try {
        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const data = {
            username: req.body.username,
            password: hashedPassword
        };

        // Check if username already used
        const usedUser = await User.findOne({ username: data.username });
        if (usedUser) {
            res.render("signup", { error: "Username already exists", success: null });
        } else {
            // Insert the data into the database
            const newUser = new User(data);
            await newUser.save();
            console.log(newUser);

            // Render the login page with a success message
            res.render("login", { success: "Account created successfully! Please log in.", error: null });
        }
    } catch (error) {
        console.error(error);
        res.render("signup", { error: "Account creation failed", success: null });
    }
});

// Login system
app.post("/login", async (req, res) => {
    try {
        // Check username
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            return res.render("login", { error: "Username or password incorrect", success: null });
        }

        // Check password
        const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
        if (isPasswordMatch) {
            req.session.user = user;
            res.redirect("/home");
        } else {
            res.render("login", { error: "Username or password incorrect", success: null });
        }

    } catch (error) {
        console.error(error);
        res.render("login", { error: "Login failed", success: null });
    }
});

// Logout system 
app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    })
});

// Add note
app.post("/note", async (req, res) => {
    try {
        const noteData = {
            title: req.body.title,
            content: req.body.content,
            userId: req.session.user._id
        };

        console.log(noteData);
        const newNote = new Note(noteData);
        await newNote.save();

        res.redirect("/home");
    } catch (error) {
        console.log(error);
        res.render("home", { error: "Failed to add note"});
    }
});

// Update system
app.post("/note/update", async (req, res) => {
    try {
        const { id, title, content } = req.body;
        console.log({ id, title, content });

        const updateNote = await Note.findByIdAndUpdate(
            id,
            { title, content },
            { new: true }
        );

        res.redirect("/home");

    } catch (error) {
        console.log(error);
        res.render("home", { error: "Failed to update note" });
    }
});

// Delete system
app.post("/note/delete", async (req, res) => {
    try {
        const { id } = req.body;
        console.log(`Delete note Id : ${id}`);
        await Note.findByIdAndDelete(id);

        res.redirect("/home");

    } catch (error) {
        console.log(error);
        res.render("home", { error: "Failed to delete note"} )
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on PORT : ${PORT}...`);
});