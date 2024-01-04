const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const User = require('../models/user');

const getProfile = async function (req, res) {
    try {
        await User.findById(req.userId)
            .then((user) => {
                if (user) {
                    const imagePath = path.join(__dirname, '..', 'uploads', user._id + '/' + user._id + '.jpg');
                    try {
                        const profileImage = fs.readFileSync(imagePath, 'base64');
                        res.status(200).json({
                            success: true,
                            data: {
                                email: user.email,
                                phone: user.phone,
                                name: user.name,
                                profileImage: profileImage
                            }
                        })
                    }
                    catch (error) {
                        res.status(200).json({
                            success: true,
                            data: {
                                email: user.email,
                                phone: user.phone,
                                name: user.name,
                                profileImage: 'Profile image not found'
                            }
                        })
                    }
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
        const uploadedFile = req.file;
        const updates = {};
        if (_.hasIn(req.body, 'name')) {
            updates['name'] = req.body['name'];
        }

        await User.findByIdAndUpdate(
            req.userId,
            updates,
            { new: true }
        )
            .then(async (updatedUser) => {
                if (updatedUser) {
                    const userId = updatedUser._id.toJSON();
                    if (uploadedFile) {
                        const userFolder = path.join(__dirname, '..', 'uploads', userId);
                        // Create the user folder if it doesn't exist
                        if (!fs.existsSync(userFolder)) {
                            fs.mkdirSync(userFolder);
                        }

                        const destinationFile = path.join(userFolder, userId + '.jpg');
                        await fse.move(uploadedFile.path, destinationFile, { overwrite: true });
                    }
                    try {
                        const imagePath = path.join(__dirname, '..', 'uploads', userId + '/' + userId + '.jpg');
                        const profileImage = fs.readFileSync(imagePath, 'base64');

                        res.status(200).json({
                            success: true,
                            data: {
                                email: updatedUser.email,
                                phone: updatedUser.phone,
                                name: updatedUser.name,
                                profileImage: profileImage
                            }
                        })
                    }
                    catch (error) {
                        res.status(200).json({
                            success: true,
                            data: {
                                email: updatedUser.email,
                                phone: updatedUser.phone,
                                name: updatedUser.name,
                                profileImage: 'Profile image not found'
                            }
                        })
                    }
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