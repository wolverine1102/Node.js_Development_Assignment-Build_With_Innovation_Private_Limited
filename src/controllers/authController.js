const _ = require('lodash');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const token = require('../middlewares/token');

const validateUser = async function(password, hash) {
    await bcrypt.compare(password, hash)
                .then((result) => {
                    return result;
                })
                .catch((error) => {
                    console.log(error);
                })
}

const register = async function (req, res) {
    try {
        let errors = {};
        const { email, phone, name, profileImage, password } = req.body;

        ['email', 'phone', 'password'].forEach(key => {
            if (req.body[key] === null || req.body[key] === undefined) {
                errors[key] = `${key} is a required parameter`;
            }
            else if (req.body[key] === "") {
                errors[key] = `${key} cannot be empty`;
            }
        });

        if (_.keys(errors).length > 0) {
            if (_.hasIn(errors, 'email') && _.hasIn(errors, 'phone')) {
                return res.status(400).json({
                    message: 'Provide at least one of the email or phone.'
                });
            }
            else if (_.hasIn(errors, 'password')) {
                return res.status(400).json({
                    message: errors['password']
                });
            }
        }

        const existingEmail = await User.findOne({
            email: email,
        });
        const existingPhone = await User.findOne({
            phone: phone,
        });
        if (existingEmail || existingPhone) {
            res.status(400).json({
                message: "User already exists"
            });
            return;
        };

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email,
            phone,
            name,
            profileImage,
            password: hashedPassword
        })

        await newUser.save();

        res.status(200).json({
            success: true,
            data: {
                email: newUser.email,
                phone: newUser.phone,
                token: token.generateAccessToken(newUser._id.toJSON())
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
};

const login = async function (req, res) {
    try {
        let errors = {};
        const { email, phone, password } = req.body;

        ['email', 'phone', 'password'].forEach(key => {
            if (req.body[key] === null || req.body[key] === undefined) {
                errors[key] = `${key} is a required parameter`;
            }
            else if (req.body[key] === "") {
                errors[key] = `${key} cannot be empty`;
            }
        });

        if (_.keys(errors).length > 0) {
            if (_.hasIn(errors, 'email') && _.hasIn(errors, 'phone')) {
                return res.status(400).json({
                    message: 'Provide one of the email or phone.'
                });
            }
            else if (_.hasIn(errors, 'password')) {
                return res.status(400).json({
                    message: errors['password']
                });
            }
        }
        else {
            return res.status(400).json({
                message: 'Provide only one of the email or phone'
            })
        };

        const user = await User.findOne({
            email: email ? email : "",
            phone: phone ? phone : ""
        });
        if (user) {
            if (validateUser(password, user.password)) {
                res.status(200).json({
                    success: true,
                    data: {
                        email: user.email,
                        phone: user.phone,
                        token: token.generateAccessToken(user._id.toJSON())
                    }
                });
            }
            else {
                res.status(401).json({
                    message: "Incorrect Credentials"
                });
            }
        }
        else {
            res.status(401).json({
                message: "Incorrect Credentials"
            });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}

module.exports = {
    register,
    login
};



