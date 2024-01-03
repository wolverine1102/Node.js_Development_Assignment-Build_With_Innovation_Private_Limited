const bcrypt = require('bcrypt');
const User = require('../models/user');

const seedAdmin = async function () {
    try {
        await User.findOne({
            email: 'admin@xyz.com',
            role: 'admin'
        })
            .then(async (admin) => {
                if (!admin) {
                    const password = await bcrypt.hash('admin_password', 10);
                    const admin = new User({
                        email: 'admin@xyz.com',
                        name: 'Admin',
                        password: password,
                        role: 'admin'
                    });
                    await admin.save();
                    console.log('Admin added successfully.');
                }
                else {
                    console.log('Admin has already been added to the database.');
                }
            })
            .catch((error) => {
                console.log(error);
            })
    }
    catch (error) {
        console.error(error);
    }
}

module.exports = { seedAdmin };