const _ = require('lodash');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const getAllProfiles = async function (req, res) {
    try {
        const usersList = [];
        await User.find({})
            .then((users) => {
                if (users) {
                    users.forEach((user) => {
                        usersList.push({
                            email: user.email,
                            phone: user.phone,
                            name: user.name,
                            profileImage: user.profileImage,
                            role: user.role
                        })
                    })
                }
                return res.status(200).json({
                    success: true,
                    data: {
                        usersList: usersList
                    }
                })
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

const getProfile = async function (req, res) {
    try {
        let errors = {};
        const { email, phone } = req.body;

        ['email', 'phone'].forEach(key => {
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
                    return res.status(200).json({
                        success: true,
                        data: {
                            email: user.email,
                            phone: user.phone,
                            name: user.name,
                            profileImage: user.profileImage,
                            role: user.role
                        }
                    });
                }
                else {
                    return res.status(401).json({
                        message: 'User does not exists.'
                    })
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

const updateProfile = async function (req, res) {
    try {
        let errors = {};
        const updates = {};
        const { email, phone } = req.body;

        ['email', 'phone'].forEach(key => {
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
        }
        else {
            return res.status(400).json({
                message: "Provide either an email or a phone number."
            })
        };
        
        ['email', 'phone', 'name', 'profileImage', 'role'].forEach((key) => {
            if (_.hasIn(req.body, key)) {
                updates[key] = req.body[key];
            }
        })

        await User.findOneAndUpdate({
            $or: [
                { email: email },
                { phone: phone }
            ]
        },
            updates,
            { new: true }
        )
            .then((updatedUser) => {
                if (updatedUser) {
                    return res.status(200).json({
                        success: true,
                        data: {
                            email: updatedUser.email,
                            phone: updatedUser.phone,
                            name: updatedUser.name,
                            profileImage: updatedUser.profileImage,
                            role: updatedUser.role
                        }
                    });
                }
                else {
                    return res.status(401).json({
                        message: 'User does not exists.'
                    })
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

const createAdmin = async function (req, res) {
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
                { email: email },
                { phone: phone }
            ]
        })
            .then(async (user) => {
                if (user) {
                    res.status(400).json({
                        message: "User already exists"
                    });
                }
                else {
                    const hashedPassword = await bcrypt.hash(password, 10);

                    const newAdmin = new User({
                        email,
                        phone,
                        name,
                        profileImage,
                        password: hashedPassword,
                        role: 'admin'
                    })

                    await newAdmin.save();

                    res.status(200).json({
                        success: true,
                        data: {
                            email: newAdmin.email,
                            phone: newAdmin.phone,
                            name: newAdmin.name,
                            profileImage: newAdmin.profileImage,
                            role: newAdmin.role
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

const deleteProfile = async function (req, res) {
    try {
        let errors = {};
        const { email, phone } = req.body;

        ['email', 'phone'].forEach(key => {
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
        }
        else {
            return res.status(400).json({
                message: "Provide either an email or a phone number."
            })
        };

        await User.findOneAndDelete({
            $or: [
                { email: email },
                { phone: phone }
            ]
        })
            .then((deletedUser) => {
                if (deletedUser) {
                    return res.status(200).json({
                        success: true,
                        data: {
                            message: "User deleted successfully."
                        }
                    });
                }
                else {
                    return res.status(401).json({
                        message: 'User does not exists.'
                    })
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

module.exports = {
    getAllProfiles,
    getProfile,
    updateProfile,
    deleteProfile,
    createAdmin
}
