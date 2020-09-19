const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.Promise = global.Promise;
mongoose.connect(process.env.DATABASE)

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Models
const { User } = require('./models/user');
const { Todo } = require('./models/todo');

// Middlewares
const { auth } = require('./middleware/auth');

//=================================
//              USERS
//=================================

// Check User Authenticated
app.get('/api/auth', auth, (req, res) => {
    res.status(200).json({
        isAuth: true,
        email: req.user.email,
        firstname: req.user.firstname,
        lastname: req.user.lastname
    })
})

// Get User Info
app.get('/api/user', auth, (req, res) => {

    User.findOne({ '_id': req.user._id }, (err, user) => {
        if (err) {
            res.status(200).json({
                status: "error",
                message: 'Failed to create todo'
            })
        }
        else {
            res.status(200).json({
                status: "success",
                message: 'User Details Fetched Successfully',
                userCredentials: user
            })
        }
    });
})

// Create User
app.post('/api/signup', (req, res) => {
    const user = new User(req.body);

    user.save((err, doc) => {
        if (err) return res.json({ success: false, err });
        res.status(200).json({
            status: "success",
            message: 'User created succesfully'
        })
    })
});

// Update User By Id
app.put('/api/user/:id', auth, (req, res) => {
    User.findOneAndUpdate({ _id: req.params.id }, { $set: req.body }, { new: true }, (err, userInfo) => {
        if (err) {
            res.status(200).json({
                status: "error",
                message: 'Failed to update user info'
            })
        }
        else {
            res.status(200).json({
                status: "success",
                message: 'User Info Updated Successfully',
                data: userInfo
            })
        }
    })
})

// User login
app.post('/api/login', (req, res) => {
    User.findOne({ 'email': req.body.email }, (err, user) => {
        if (!user) return res.json({ loginSuccess: false, message: 'Auth failed, email not found' });

        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch) return res.json({ loginSuccess: false, message: 'Wrong password' });
            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);
                res.cookie('w_auth', user.token).status(200).json({
                    status: "success",
                    message: 'User logged in succesfully',
                    token: user.token
                })
            })
        })
    })
})

// User Logout
app.get('/api/logout', auth, (req, res) => {
    User.findOneAndUpdate(
        { _id: req.user._id },
        { token: '' },
        (err, doc) => {
            if (err) return res.json({ success: false, err });
            return res.status(200).send({
                status: "success",
                message: 'User logged out succesfully'
            })
        }
    )
})

//=================================
//              TODO
//=================================

// Create Todo
app.post('/api/todo', auth, (req, res) => {

    var todoObj = new Todo({
        title: req.body.title,
        body: req.body.body,
        created_by: mongoose.Types.ObjectId(req.user.id)
    });
    // const todoObj = new Todo(req.body);

    todoObj.save((err, doc) => {
        if (err) {

            console.log('Error : ', err);

            res.status(200).json({
                status: "error",
                message: 'Failed to create todo'
            })
        }
        else {
            res.status(200).json({
                status: "success",
                message: 'Todo Item Added Successfully',
                data: doc
            })
        }
    })
})

// List All Todo
app.get('/api/todos', auth, (req, res) => {

    let query = {
        created_by: new mongoose.Types.ObjectId(req.user.id)
    };

    Todo.find(query, (err, projects) => {
        if (err) {
            res.status(200).json({
                status: "error",
                message: 'Failed to fetch todo list'
            })
        }
        else {
            res.status(200).json({
                status: "success",
                message: 'Todo List Fetched Successfully',
                data: projects
            })
        }
    })
})

// Get Todo By Id
app.get('/api/todo/:id', auth, (req, res) => {
    Todo.findOne({ _id: req.params.id }, (err, projects) => {
        if (err) {
            res.status(200).json({
                status: "error",
                message: 'Failed to fetch todo'
            })
        }
        else {

            if (projects) {
                res.status(200).json({
                    status: "success",
                    message: 'Todo Info Fetched Successfully',
                    data: projects
                })
            }
            else {
                res.status(200).json({
                    status: "success",
                    message: 'Todo Info Not Found'
                })
            }
        }
    })
})

// Update Todo By Id
app.put('/api/todo/:id', auth, (req, res) => {
    Todo.findOneAndUpdate({ _id: req.params.id }, { $set: req.body }, { new: true }, (err, projects) => {
        if (err) {
            res.status(200).json({
                status: "error",
                message: 'Failed to update todo'
            })
        }
        else {
            res.status(200).json({
                status: "success",
                message: 'Todo Info Updated Successfully',
                data: projects
            })
        }
    })
})

// Delete Todo By Id
app.delete('/api/todo/:id', auth, (req, res) => {
    Todo.remove({ _id: req.params.id }, (err, projects) => {
        if (err) {
            res.status(200).json({
                status: "error",
                message: 'Unable to delete Todo Item'
            })
        }
        else {
            res.status(200).json({
                status: "success",
                message: 'Todo Item Deleted Successfully'
            })
        }
    })
})

const port = process.env.PORT || 3002;
app.listen(port, () => {
    console.log(`Server Running at ${port}`)
})
