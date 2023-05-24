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
                const token = await jwt.sign({userID: loginInstance._id, username: loginInstance.username}, process.env.JWT_SECRET);
                res.cookie("token", token).status(201).json({status: "OK", message: "Login credentials are correct. Cookie created", userID: loginInstance._id, username: loginInstance.username});
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

const verifyLogin = async (req, res) => {
    try {
        const decodedToken = await jwt.verify(req.cookies.token , process.env.JWT_SECRET);
        if(decodedToken.userID) {
            const username = await UserModel.findOne({_id: decodedToken.userID});
            res.json({status: "OK", message: "Cookie is present. Allow access to protected sites", username: username.username});
        } else {
            res.json({status: "Error", message: "User login cookie not found"});
        }
    } catch(error) {
        console.log("Error: " + error);
        res.json({status: "Error", message: "User login cookie not found"});
    }
}

const logout = (req, res) => {
    res.clearCookie("token");
    res.json({status: "OK", message: "Cookie has been cleared"});
}

module.exports = { register, login, verifyLogin, logout };