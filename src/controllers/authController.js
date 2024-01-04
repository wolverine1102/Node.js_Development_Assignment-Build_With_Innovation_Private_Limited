const _ = require('lodash');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const User = require('../models/user');
const token = require('../middlewares/token');

const validateUser = async function (password, hash) {
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
        const uploadedFile = req.file;
        const { email, phone, name, password } = req.body;

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
                    message: 'Provide at least one of the following: email or phone.'
                });
            }
            else if (_.hasIn(errors, 'password')) {
                return res.status(400).json({
                    message: errors['password']
                });
            }
        }

        await User.findOne({
            $or: [
                { email: { $eq: email ? email : "" } },
                { phone: { $eq: phone ? phone : "" } }
            ]
        })
            .then(async (user) => {
                if (user) {
                    // If user authentication fails, delete the uploaded file
                    fs.unlinkSync(uploadedFile.path);
                    res.status(400).json({
                        message: "User already exists"
                    });
                }
                else {
                    const hashedPassword = await bcrypt.hash(password, 10);

                    const newUser = new User({
                        email,
                        phone,
                        name,
                        password: hashedPassword
                    })

                    await newUser.save();

                    const userId = newUser._id.toJSON();

                    if (uploadedFile) {
                        const newUserFolder = path.join(__dirname, '..', 'uploads', userId);
                        // Create the user folder if it doesn't exist
                        if (!fs.existsSync(newUserFolder)) {
                            fs.mkdirSync(newUserFolder);
                        }
                        const destinationFile = path.join(newUserFolder, userId + '.jpg');
                        await fse.move(uploadedFile.path, destinationFile);
                    }

                    res.status(200).json({
                        success: true,
                        data: {
                            email: newUser.email,
                            phone: newUser.phone,
                            token: token.generateAccessToken(userId)
                        }
                    });
                }
            })
            .catch((error) => {
                console.log(error);
            })
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
                    message: "Provide one of the following: email or phone."
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
                message: "Provide either an email or a phone number."
            })
        };

        await User.findOne({
            $or: [
                { email: email },
                { phone: phone }
            ]
        })
            .then((user) => {
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
            })
            .catch((error) => {
                console.log(error);
            })
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



