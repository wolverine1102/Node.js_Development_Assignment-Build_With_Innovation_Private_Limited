const _ = require('lodash');
const User = require('../models/user');

const getProfile = async function (req, res) {
    try {
        await User.findById(req.userId)
            .then((user) => {
                if (user) {
                    return res.status(200).json({
                        success: true,
                        data: {
                            email: user.email,
                            phone: user.phone,
                            name: user.name,
                            profileImage: user.profileImage
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
        const updates = {};

        ['name', 'profileImage'].forEach((key) => {
            if (_.hasIn(req.body, key)) {
                updates[key] = req.body[key];
            }
        })

        await User.findByIdAndUpdate(
            req.userId, 
            updates,
            { new: true }
            )
            .then((updatedUser) => {
                if (updatedUser) {
                    res.status(200).json({
                        success: true,
                        data: {
                            email: updatedUser.email,
                            phone: updatedUser.phone,
                            name: updatedUser.name,
                            profileImage: updatedUser.profileImage
                        }
                    })
                }
                else {
                    return res.status(401).json({
                        message: 'User does not exists.'
                    })
                }
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
        await User.findByIdAndDelete(req.userId)
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
    getProfile,
    updateProfile,
    deleteProfile
};