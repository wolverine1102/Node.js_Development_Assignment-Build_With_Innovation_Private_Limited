const _ = require('lodash');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const User = require('../models/user');

const getAllProfiles = async function (req, res) {
    try {
        const usersList = [];
        await User.find({})
            .then((users) => {
                if (users) {
                    users.forEach((user) => {
                        const imagePath = path.join(__dirname, '..', 'uploads', user._id + '/' + user._id + '.jpg');
                        try {
                            const profileImage = fs.readFileSync(imagePath, 'base64');
                            usersList.push({
                                email: user.email,
                                phone: user.phone,
                                name: user.name,
                                role: user.role,
                                profileImage: profileImage
                            })
                        }
                        catch (error) {
                            usersList.push({
                                email: user.email,
                                phone: user.phone,
                                name: user.name,
                                role: user.role,
                                profileImage: 'Profile image not found'
                            })
                        }
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
                { email: { $eq: email ? email : "" } },
                { phone: { $eq: phone ? phone : "" } }
            ]
        })
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
                                profileImage: profileImage,
                                role: user.role
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
                                profileImage: 'Profile image not found',
                                role: user.role
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
        let errors = {};
        const updates = {};
        const uploadedFile = req.file;
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
                fs.unlinkSync(uploadedFile.path);
                return res.status(400).json({
                    message: "Provide one of the following: email or phone."
                });
            }
        }
        else {
            fs.unlinkSync(uploadedFile.path);
            return res.status(400).json({
                message: "Provide either an email or a phone number."
            })
        };

        ['name', 'role'].forEach((key) => {
            if (_.hasIn(req.body, key)) {
                updates[key] = req.body[key];
            }
        })

        await User.findOneAndUpdate({
            $or: [
                { email: { $eq: email ? email : "" } },
                { phone: { $eq: phone ? phone : "" } }
            ]
        },
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
                fs.unlinkSync(uploadedFile.path);
                return res.status(400).json({
                    message: 'Provide at least one of the following: email or phone.'
                });
            }
            else if (_.hasIn(errors, 'password')) {
                fs.unlinkSync(uploadedFile.path);
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

                    const newAdmin = new User({
                        email,
                        phone,
                        name,
                        password: hashedPassword,
                        role: 'admin'
                    })

                    await newAdmin.save();

                    const adminId = newAdmin._id.toJSON();

                    if (uploadedFile) {
                        const newAdminFolder = path.join(__dirname, '..', 'uploads', adminId);
                        // Create the user folder if it doesn't exist
                        if (!fs.existsSync(newAdminFolder)) {
                            fs.mkdirSync(newAdminFolder);
                        }
                        const destinationFile = path.join(newAdminFolder, adminId + '.jpg');
                        await fse.move(uploadedFile.path, destinationFile);
                    }
                    try {
                        const imagePath = path.join(__dirname, '..', 'uploads', adminId + '/' + adminId + '.jpg');
                        const profileImage = fs.readFileSync(imagePath, 'base64');
                        res.status(200).json({
                            success: true,
                            data: {
                                email: newAdmin.email,
                                phone: newAdmin.phone,
                                name: newAdmin.name,
                                profileImage: profileImage,
                                role: newAdmin.role
                            }
                        })
                    }
                    catch (error) {
                        res.status(200).json({
                            success: true,
                            data: {
                                email: newAdmin.email,
                                phone: newAdmin.phone,
                                name: newAdmin.name,
                                profileImage: 'Profile image not found',
                                role: newAdmin.role
                            }
                        })
                    }
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
                { email: { $eq: email ? email : "" } },
                { phone: { $eq: phone ? phone : "" } }
            ]
        })
            .then((deletedUser) => {
                if (deletedUser) {
                    const userId = deletedUser._id.toJSON();
                    const profileImage = path.join(__dirname, '..', 'uploads', userId);

                    fse.remove(profileImage, err => {
                        if (err) return console.error('profileImage not found.')
                        console.log('profileImage deleted successfully.')
                    })

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
