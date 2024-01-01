const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    phone: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profileImage: {
        type: String
    },
    roles: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Role'
    }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;