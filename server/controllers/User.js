const { UserModel } = require("../models/User");
const jwt = require('jsonwebtoken');
const hash = require('sha256');

const register = async (req,res) => {
    const newUser = await UserModel.create({
        username: req.body.username,
        password: hash(req.body.password)
    });
    console.log("New user has been created");

    res.json({status: "OK"});
}

const login = async (req,res) => {
    const loginInstance = await UserModel.findOne({username: req.body.username});
    if(loginInstance) {
        if(loginInstance.password === hash(req.body.password)) {
            try {
                const token = await jwt.sign({userID: loginInstance._id}, process.env.JWT_SECRET);
                res.cookie("token", token).status(201).json({status: "OK", message: "Login credentials are correct. Cookie created"})
            } catch(error) {
                console.log(error.message);
            }
        } else {
            res.json({status: "Error", message: "Incorrect password"});
        }
    } else {
        res.json({status: "Error", message: "User not found"});
    }
}

module.exports = { register, login };